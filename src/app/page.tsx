import { redirect } from 'next/navigation';

// MatMX ERP - Internal System Only
// Redirect all root traffic to admin login
export default function Home() {
  redirect('/admin/login');
}
