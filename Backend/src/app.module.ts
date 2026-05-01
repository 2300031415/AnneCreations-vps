import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsModule } from './modules/products/products.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { BannersModule } from './modules/banners/banners.module';
import { SearchModule } from './modules/search/search.module';
import { CartModule } from './modules/cart/cart.module';
import { WishlistModule } from './modules/wishlist/wishlist.module';
import { CouponsModule } from './modules/coupons/coupons.module';
import { CheckoutModule } from './modules/checkout/checkout.module';
import { OrdersModule } from './modules/orders/orders.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AiModule } from './modules/ai/ai.module';
import { SettingsModule } from './modules/settings/settings.module';
import { BackupsModule } from './modules/backups/backups.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { SystemModule } from './modules/system/system.module';
import { ContactModule } from './modules/contact/contact.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { ZonesModule } from './modules/zones/zones.module';
import { CountriesModule } from './modules/countries/countries.module';
import { RolesModule } from './modules/roles/roles.module';
import { PopupsModule } from './modules/popups/popups.module';
import { DownloadsModule } from './modules/downloads/downloads.module';
import { LanguagesModule } from './modules/languages/languages.module';
import { MigrationModule } from './modules/migration/migration.module';
import { SalesModule } from './modules/sales/sales.module';

@Module({
  imports: [
    // Configuration Module for environment variables (.env files)
    ConfigModule.forRoot({
      isGlobal: true, // Make configuration available everywhere
      envFilePath: '.env', // Target the .env file in the root directory
    }),

    // Mongoose connection async configuration
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        dbName: configService.get<string>('DB_NAME') || 'annecreations',
        // Example: other mongoose options could go here
      }),
    }),
    // Feature Modules:
    AuthModule,
    ProductsModule,
    UsersModule,
    CategoriesModule,
    BannersModule,
    SearchModule,
    CartModule,
    WishlistModule,
    CouponsModule,
    CheckoutModule,
    OrdersModule,
    DashboardModule,
    AnalyticsModule,
    AiModule,
    SettingsModule,
    BackupsModule,
    ReviewsModule,
    SystemModule,
    ContactModule,
    WalletModule,
    ZonesModule,
    CountriesModule,
    RolesModule,
    PopupsModule,
    DownloadsModule,
    LanguagesModule,
    MigrationModule,
    SalesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
