import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart, CartDocument } from './schemas/cart.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { SalesService } from '../sales/sales.service';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private readonly salesService: SalesService,
  ) {}

  async getCart(customerId: string) {
    let cart = await this.cartModel.findOne({ customerId: new Types.ObjectId(customerId) } as any)
      .populate('items.product')
      .populate('items.product.categories')
      .populate('items.options.option', 'name')
      .lean();

    if (!cart) {
      const newCart = new this.cartModel({
        customerId: new Types.ObjectId(customerId),
        items: [],
      });
      await newCart.save();
      cart = await this.cartModel.findById(newCart._id)
        .populate('items.product', 'productModel sku image description categories')
        .populate('items.options.option', 'name')
        .lean();
    }

    if (!cart) {
      return { items: [], itemCount: 0, subtotal: 0 };
    }

    // Always recalculate prices in getCart to reflect latest Global Sales
    const config = await this.salesService.getConfig();
    let updatedItems = [];
    for (let item of cart.items) {
        if (!item.product) continue;
        
        let itemSubtotal = 0;
        let updatedOptions = [];
        for (let opt of item.options) {
            // Pass pre-fetched config to avoid DB query for each option
            const price = await this.salesService.getDiscountedPrice(item.product, opt, config);
            updatedOptions.push({ ...opt, salePrice: price });
            itemSubtotal += price;
        }
        updatedItems.push({ ...item, options: updatedOptions, subtotal: itemSubtotal });
    }
    cart.items = updatedItems;

    return this.formatCart(cart);
  }

  async addToCart(customerId: string, productId: string, options: string[]) {
    if (!Types.ObjectId.isValid(productId)) {
      throw new BadRequestException('Invalid product ID');
    }

    const product = await this.productModel.findById(productId).populate('options.option', 'name').populate('categories');
    if (!product) throw new NotFoundException('Product not found');
    if (!product.status) throw new BadRequestException('Product is not available');

    // Check if already purchased
    const alreadyPurchased = await this.checkAlreadyPurchased(customerId, productId, options, product);
    if (alreadyPurchased) {
      throw new ConflictException('You have already purchased some of these product options.');
    }

    let cart = await this.cartModel.findOne({ customerId: new Types.ObjectId(customerId) } as any);
    if (!cart) {
      cart = new this.cartModel({ customerId: new Types.ObjectId(customerId), items: [] });
    }

    const existingItemIndex = cart.items.findIndex(item => item.product.toString() === productId);

    if (existingItemIndex !== -1) {
      const existingOptionIds = cart.items[existingItemIndex].options.map(o => (o as any)._id.toString());
      const allOptionsIds = Array.from(new Set([...existingOptionIds, ...options.map(String)]));

      cart.items[existingItemIndex].options = (product.options as any[]).filter(o => 
        allOptionsIds.includes(o._id.toString())
      );

      let itemSubtotal = 0;
      for (const opt of cart.items[existingItemIndex].options) {
          itemSubtotal += await this.salesService.getDiscountedPrice(product, opt);
      }
      cart.items[existingItemIndex].subtotal = itemSubtotal;

    } else {
      const cartOptions = (product.options as any[]).filter(o => options.map(String).includes(o._id.toString()));
      
      let subtotal = 0;
      for (const opt of cartOptions) {
          subtotal += await this.salesService.getDiscountedPrice(product, opt);
      }

      cart.items.push({
        _id: new Types.ObjectId() as any,
        product: new Types.ObjectId(productId) as any,
        options: cartOptions as any,
        subtotal,
      } as any);
    }

    return await cart.save();
  }

  async updateCartItem(customerId: string, productId: string, options: string[]) {
    if (!Types.ObjectId.isValid(productId)) {
      throw new BadRequestException('Invalid product ID');
    }

    const product = await this.productModel.findById(productId).populate('options.option', 'name').populate('categories');
    if (!product) throw new NotFoundException('Product not found');

    let cart = await this.cartModel.findOne({ customerId: new Types.ObjectId(customerId) } as any);
    if (!cart) throw new NotFoundException('Cart not found');

    const existingItemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    if (existingItemIndex === -1) throw new NotFoundException('Item not found in cart');

    // Replace options instead of merging
    const selectedOptionsIds = options.map(String);
    cart.items[existingItemIndex].options = (product.options as any[]).filter(o => 
      selectedOptionsIds.includes(o._id.toString())
    );

    if (cart.items[existingItemIndex].options.length === 0) {
      cart.items.splice(existingItemIndex, 1);
    } else {
      let itemSubtotal = 0;
      for (const opt of cart.items[existingItemIndex].options) {
          itemSubtotal += await this.salesService.getDiscountedPrice(product, opt);
      }
      cart.items[existingItemIndex].subtotal = itemSubtotal;
    }

    return await cart.save();
  }

  async removeFromCart(customerId: string, productId: string) {
    const cart = await this.cartModel.findOne({ customerId: new Types.ObjectId(customerId) } as any);
    if (!cart) throw new NotFoundException('Cart not found');

    cart.items = cart.items.filter(item => item.product.toString() !== productId);
    return await cart.save();
  }

  async clearCart(customerId: string) {
    const cart = await this.cartModel.findOne({ customerId: new Types.ObjectId(customerId) } as any);
    if (!cart) return { message: 'Cart already empty' };

    cart.items = [];
    return await cart.save();
  }

  private async checkAlreadyPurchased(customerId: string, productId: string, options: string[], product: ProductDocument) {
    const purchasedOptionsAgg = await this.orderModel.aggregate([
      {
        $match: {
          customer: new Types.ObjectId(customerId),
          orderStatus: 'paid',
          'products.product': new Types.ObjectId(productId),
        },
      },
      { $unwind: '$products' },
      { $match: { 'products.product': new Types.ObjectId(productId) } },
      { $unwind: '$products.options' },
      {
        $group: {
          _id: null,
          purchasedOptions: { $addToSet: '$products.options.option' },
        },
      },
    ]);

    if (purchasedOptionsAgg.length > 0) {
      const purchasedOptions = new Set<string>(
        purchasedOptionsAgg[0].purchasedOptions.map((opt: any) => opt.toString())
      );

      const requestedProductOptions = (product.options as any[]).filter(o => options.includes(o._id.toString()));
      const requestedOptionIds = requestedProductOptions.map(o => o.option['_id']?.toString() || o.option.toString());

      return requestedOptionIds.some(id => purchasedOptions.has(id));
    }
    return false;
  }

  private formatCart(cart: any) {
    return {
      _id: cart._id.toString(),
      customerId: cart.customerId,
      items: cart.items.map((item: any) => ({
        _id: item._id?.toString(),
        product: item.product,
        options: item.options,
        subtotal: item.subtotal,
      })),
      itemCount: cart.items.length,
      subtotal: cart.items.reduce((sum: number, item: any) => sum + item.subtotal, 0),
    };
  }
}
