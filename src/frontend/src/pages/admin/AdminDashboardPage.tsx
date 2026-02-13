import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import AdminListingsPanel from '../../components/admin/AdminListingsPanel';
import AdminOrdersPanel from '../../components/admin/AdminOrdersPanel';
import LoginButton from '../../components/auth/LoginButton';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('listings');

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/' })}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Store
              </Button>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            </div>
            <LoginButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="listings">Listings</TabsTrigger>
            <TabsTrigger value="orders">Order Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="listings" className="space-y-4">
            <AdminListingsPanel />
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <AdminOrdersPanel />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
