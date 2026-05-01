import { redirect } from 'next/navigation';

export default function AnalyticsPage() {
    // Redirect to the default analytics view, now 'products'
    redirect('/dashboard/analytics/products');
}
