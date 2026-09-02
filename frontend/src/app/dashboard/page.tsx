import { redirect } from 'next/navigation';

export default function DashboardRoot() {
  // Automatically send users to the Hindi/Indic dashboard by default
  redirect('/dashboard/hindi');
}