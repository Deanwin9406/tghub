
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { 
  Users, 
  Building, 
  UserCheck, 
  Settings, 
  AlertTriangle,
  Loader2,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Shield,
  EyeOff,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  roles: string[];
  status: string;
  created_at: string;
}

interface Property {
  id: string;
  title: string;
  address: string;
  property_type: string;
  status: string;
  owner: {
    first_name: string;
    last_name: string;
  };
  created_at: string;
  verification_status: string;
}

interface SystemSetting {
  id: string;
  setting_name: string;
  setting_value: string;
  setting_description: string;
  updated_at: string;
}

const Admin = () => {
  const { user, roles } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [pendingKyc, setPendingKyc] = useState<any[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSetting[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('all');
  const [propertyStatusFilter, setPropertyStatusFilter] = useState('all');
  const [editSettingId, setEditSettingId] = useState<string | null>(null);
  const [editSettingValue, setEditSettingValue] = useState('');
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showUserActionDialog, setShowUserActionDialog] = useState(false);
  const [userActionType, setUserActionType] = useState<'suspend' | 'delete' | 'role'>('suspend');
  const [selectedRole, setSelectedRole] = useState('');
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    totalProperties: 0,
    pendingVerifications: 0,
    activeLeases: 0
  });

  useEffect(() => {
    if (user && roles.includes('admin')) {
      fetchDashboardData();
    } else {
      toast({
        title: "Accès refusé",
        description: "Vous n'avez pas la permission d'accéder au tableau de bord administrateur",
        variant: "destructive"
      });
    }
  }, [user, roles]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch system stats
      const [
        { count: totalUsers }, 
        { count: totalProperties },
        { count: pendingVerifications },
        { count: activeLeases }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('properties').select('*', { count: 'exact', head: true }),
        supabase.from('kyc_verifications').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('leases').select('*', { count: 'exact', head: true }).eq('status', 'active')
      ]);
      
      setSystemStats({
        totalUsers: totalUsers || 0,
        totalProperties: totalProperties || 0,
        pendingVerifications: pendingVerifications || 0,
        activeLeases: activeLeases || 0
      });

      // Fetch pending KYC verifications
      const { data: kycData, error: kycError } = await supabase
        .from('kyc_verifications')
        .select(`
          id,
          user_id,
          status,
          created_at,
          profiles:user_id (
            first_name,
            last_name,
            email
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (kycError) throw kycError;
      setPendingKyc(kycData || []);

      // Fetch user data
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          first_name,
          last_name,
          status,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (userError) throw userError;
      
      // Fetch roles for each user
      const usersWithRoles = await Promise.all((userData || []).map(async (profile) => {
        const { data: userRoles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', profile.id);
        
        return {
          ...profile,
          roles: (userRoles || []).map(r => r.role)
        };
      }));
      
      setUsers(usersWithRoles);

      // Fetch properties
      const { data: propertyData, error: propertyError } = await supabase
        .from('properties')
        .select(`
          id,
          title,
          address,
          property_type,
          status,
          verification_status,
          created_at,
          owner:owner_id (
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false });

      if (propertyError) throw propertyError;
      setProperties(propertyData || []);

      // Fetch system settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('system_settings')
        .select('*')
        .order('setting_name', { ascending: true });

      if (settingsError) throw settingsError;
      setSystemSettings(settingsData || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast({
        title: "Erreur",
        description: "Échec du chargement des données du tableau de bord administrateur",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKycApproval = async (id: string, approved: boolean) => {
    try {
      const { error } = await supabase
        .from('kyc_verifications')
        .update({ status: approved ? 'approved' : 'rejected' })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: `Vérification KYC ${approved ? 'approuvée' : 'rejetée'}`,
        variant: "default"
      });

      // Refresh the data
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating KYC status:', error);
      toast({
        title: "Erreur",
        description: "Échec de la mise à jour du statut KYC",
        variant: "destructive"
      });
    }
  };

  const handleUpdateSetting = async () => {
    if (!editSettingId) return;
    
    try {
      const { error } = await supabase
        .from('system_settings')
        .update({ setting_value: editSettingValue })
        .eq('id', editSettingId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Paramètre système mis à jour avec succès",
        variant: "default"
      });

      // Close dialog and refresh data
      setShowEditDialog(false);
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating system setting:', error);
      toast({
        title: "Erreur",
        description: "Échec de la mise à jour du paramètre système",
        variant: "destructive"
      });
    }
  };

  const handleUserAction = async () => {
    if (!selectedUserId) return;
    
    try {
      if (userActionType === 'suspend') {
        const { error } = await supabase
          .from('profiles')
          .update({ status: 'suspended' })
          .eq('id', selectedUserId);
          
        if (error) throw error;
        
        toast({
          title: "Succès",
          description: "Compte utilisateur suspendu",
          variant: "default"
        });
      } else if (userActionType === 'delete') {
        // In a real application, you might want to perform a soft delete or anonymize data
        // rather than a hard delete
        const { error } = await supabase
          .from('profiles')
          .update({ 
            status: 'deleted',
            email: `deleted_${Date.now()}@example.com`,
            first_name: 'Deleted',
            last_name: 'User'
          })
          .eq('id', selectedUserId);
          
        if (error) throw error;
        
        toast({
          title: "Succès",
          description: "Compte utilisateur supprimé",
          variant: "default"
        });
      } else if (userActionType === 'role') {
        // Check if user already has this role
        const { data: existingRole } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', selectedUserId)
          .eq('role', selectedRole);
          
        if (existingRole && existingRole.length > 0) {
          // Remove role
          const { error } = await supabase
            .from('user_roles')
            .delete()
            .eq('user_id', selectedUserId)
            .eq('role', selectedRole);
            
          if (error) throw error;
          
          toast({
            title: "Succès",
            description: `Rôle ${selectedRole} retiré`,
            variant: "default"
          });
        } else {
          // Add role
          const { error } = await supabase
            .from('user_roles')
            .insert({ user_id: selectedUserId, role: selectedRole });
            
          if (error) throw error;
          
          toast({
            title: "Succès",
            description: `Rôle ${selectedRole} ajouté`,
            variant: "default"
          });
        }
      }

      // Close dialog and refresh data
      setShowUserActionDialog(false);
      fetchDashboardData();
    } catch (error) {
      console.error('Error performing user action:', error);
      toast({
        title: "Erreur",
        description: "Échec de l'action sur l'utilisateur",
        variant: "destructive"
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = userStatusFilter === 'all' || user.status === userStatusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const filteredProperties = properties.filter(property => {
    const matchesSearch = 
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = propertyStatusFilter === 'all' || property.status === propertyStatusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-8 flex justify-center items-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Tableau de bord administrateur</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Utilisateurs totaux</CardDescription>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">{systemStats.totalUsers}</CardTitle>
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Propriétés totales</CardDescription>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">{systemStats.totalProperties}</CardTitle>
                <Building className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Vérifications en attente</CardDescription>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">{systemStats.pendingVerifications}</CardTitle>
                <UserCheck className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Baux actifs</CardDescription>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">{systemStats.activeLeases}</CardTitle>
                <Settings className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
          </Card>
        </div>
        
        <Tabs defaultValue="verifications" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="verifications">Vérifications KYC</TabsTrigger>
            <TabsTrigger value="properties">Propriétés</TabsTrigger>
            <TabsTrigger value="users">Gestion des utilisateurs</TabsTrigger>
            <TabsTrigger value="settings">Paramètres système</TabsTrigger>
          </TabsList>
          
          <TabsContent value="verifications">
            <Card>
              <CardHeader>
                <CardTitle>Vérifications KYC en attente</CardTitle>
                <CardDescription>
                  Approuver ou rejeter les vérifications d'identité des utilisateurs
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingKyc.length > 0 ? (
                  <div className="space-y-4">
                    {pendingKyc.map((kyc) => (
                      <div key={kyc.id} className="flex items-center justify-between bg-muted/50 p-4 rounded-md">
                        <div>
                          <p className="font-medium">
                            {kyc.profiles?.first_name} {kyc.profiles?.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {kyc.profiles?.email}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Soumis le: {new Date(kyc.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleKycApproval(kyc.id, false)}
                          >
                            Rejeter
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleKycApproval(kyc.id, true)}
                          >
                            Approuver
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <UserCheck className="h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">Aucune vérification KYC en attente</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="properties">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <CardTitle>Gestion des propriétés</CardTitle>
                    <CardDescription>
                      Gérer les annonces et les vérifications de propriétés
                    </CardDescription>
                  </div>
                  <div className="flex w-full md:w-auto gap-2">
                    <div className="relative w-full md:w-64">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Rechercher des propriétés..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Select
                      value={propertyStatusFilter}
                      onValueChange={setPropertyStatusFilter}
                    >
                      <SelectTrigger className="w-[130px]">
                        <SelectValue placeholder="Statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les statuts</SelectItem>
                        <SelectItem value="available">Disponible</SelectItem>
                        <SelectItem value="rented">Loué</SelectItem>
                        <SelectItem value="sold">Vendu</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="pending">En attente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredProperties.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Propriété</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead>Propriétaire</TableHead>
                          <TableHead>Date de création</TableHead>
                          <TableHead>Vérification</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProperties.map((property) => (
                          <TableRow key={property.id}>
                            <TableCell className="font-medium">
                              <div>
                                <div>{property.title}</div>
                                <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                  {property.address}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{property.property_type}</TableCell>
                            <TableCell>
                              <Badge variant={
                                property.status === 'available' ? 'default' :
                                property.status === 'rented' ? 'secondary' :
                                property.status === 'sold' ? 'outline' :
                                'destructive'
                              }>
                                {
                                  property.status === 'available' ? 'Disponible' :
                                  property.status === 'rented' ? 'Loué' :
                                  property.status === 'sold' ? 'Vendu' :
                                  property.status === 'pending' ? 'En attente' :
                                  property.status === 'maintenance' ? 'Maintenance' :
                                  property.status
                                }
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {property.owner?.first_name} {property.owner?.last_name}
                            </TableCell>
                            <TableCell>
                              {new Date(property.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Badge variant={
                                property.verification_status === 'verified' ? 'success' :
                                property.verification_status === 'pending' ? 'warning' :
                                'destructive'
                              }>
                                {
                                  property.verification_status === 'verified' ? 'Vérifié' :
                                  property.verification_status === 'pending' ? 'En attente' :
                                  property.verification_status === 'rejected' ? 'Rejeté' :
                                  property.verification_status
                                }
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Menu</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem>Voir les détails</DropdownMenuItem>
                                  <DropdownMenuItem>Modifier</DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-green-600">
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Vérifier la propriété
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600">
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Rejeter la vérification
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Building className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium mb-2">Aucune propriété trouvée</p>
                    <p className="text-muted-foreground">
                      Aucune propriété ne correspond à vos critères de recherche
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <CardTitle>Gestion des utilisateurs</CardTitle>
                    <CardDescription>
                      Gérer les utilisateurs, les rôles et les permissions
                    </CardDescription>
                  </div>
                  <div className="flex w-full md:w-auto gap-2">
                    <div className="relative w-full md:w-64">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Rechercher des utilisateurs..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Select
                      value={userStatusFilter}
                      onValueChange={setUserStatusFilter}
                    >
                      <SelectTrigger className="w-[130px]">
                        <SelectValue placeholder="Statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les statuts</SelectItem>
                        <SelectItem value="active">Actif</SelectItem>
                        <SelectItem value="pending">En attente</SelectItem>
                        <SelectItem value="suspended">Suspendu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredUsers.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Utilisateur</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Rôles</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead>Date d'inscription</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">
                              {user.first_name} {user.last_name}
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {user.roles.map((role, index) => (
                                  <Badge key={index} variant="outline" className="capitalize">
                                    {
                                      role === 'admin' ? 'Administrateur' :
                                      role === 'tenant' ? 'Locataire' :
                                      role === 'owner' ? 'Propriétaire' :
                                      role === 'agent' ? 'Agent' :
                                      role === 'vendor' ? 'Fournisseur' :
                                      role
                                    }
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={
                                user.status === 'active' ? 'success' :
                                user.status === 'pending' ? 'warning' :
                                user.status === 'suspended' ? 'destructive' :
                                'outline'
                              }>
                                {
                                  user.status === 'active' ? 'Actif' :
                                  user.status === 'pending' ? 'En attente' :
                                  user.status === 'suspended' ? 'Suspendu' :
                                  user.status
                                }
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(user.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Menu</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem>Voir le profil</DropdownMenuItem>
                                  <DropdownMenuItem>Modifier</DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => {
                                      setSelectedUserId(user.id);
                                      setUserActionType('role');
                                      setSelectedRole('admin');
                                      setShowUserActionDialog(true);
                                    }}
                                  >
                                    <Shield className="h-4 w-4 mr-2" />
                                    {user.roles.includes('admin') ? 'Supprimer rôle admin' : 'Ajouter rôle admin'}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => {
                                      setSelectedUserId(user.id);
                                      setUserActionType('role');
                                      setSelectedRole('vendor');
                                      setShowUserActionDialog(true);
                                    }}
                                  >
                                    <Shield className="h-4 w-4 mr-2" />
                                    {user.roles.includes('vendor') ? 'Supprimer rôle fournisseur' : 'Ajouter rôle fournisseur'}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => {
                                      setSelectedUserId(user.id);
                                      setUserActionType('suspend');
                                      setShowUserActionDialog(true);
                                    }}
                                    className="text-amber-600"
                                  >
                                    <EyeOff className="h-4 w-4 mr-2" />
                                    Suspendre l'utilisateur
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => {
                                      setSelectedUserId(user.id);
                                      setUserActionType('delete');
                                      setShowUserActionDialog(true);
                                    }}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Supprimer l'utilisateur
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Users className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium mb-2">Aucun utilisateur trouvé</p>
                    <p className="text-muted-foreground">
                      Aucun utilisateur ne correspond à vos critères de recherche
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres système</CardTitle>
                <CardDescription>
                  Configurer les paramètres et options de l'application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid gap-6">
                    {systemSettings.length > 0 ? (
                      systemSettings.map((setting) => (
                        <div key={setting.id} className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center p-4 border rounded-lg">
                          <div className="space-y-0.5">
                            <h3 className="font-medium">{setting.setting_name}</h3>
                            <p className="text-sm text-muted-foreground">{setting.setting_description}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {setting.setting_value === 'true' || setting.setting_value === 'false' ? (
                              <Switch 
                                checked={setting.setting_value === 'true'} 
                                onCheckedChange={(checked) => {
                                  setEditSettingId(setting.id);
                                  setEditSettingValue(checked ? 'true' : 'false');
                                  handleUpdateSetting();
                                }}
                              />
                            ) : (
                              <>
                                <span className="text-sm">{setting.setting_value}</span>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    setEditSettingId(setting.id);
                                    setEditSettingValue(setting.setting_value);
                                    setShowEditDialog(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Settings className="h-12 w-12 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">Aucun paramètre système disponible</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="border-t pt-6">
                    <h3 className="font-medium mb-4">Actions système</h3>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">Nettoyer la base de données</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-4">
                            Supprime les données temporaires et les enregistrements expirés
                          </p>
                          <Button size="sm" variant="outline" className="w-full">
                            Exécuter
                          </Button>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">Générer des rapports</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-4">
                            Crée un rapport mensuel des activités système
                          </p>
                          <Button size="sm" variant="outline" className="w-full">
                            Générer
                          </Button>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">Mode maintenance</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-4">
                            Active/désactive le mode maintenance du site
                          </p>
                          <Button size="sm" variant="outline" className="w-full">
                            Activer
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Edit Setting Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le paramètre système</DialogTitle>
            <DialogDescription>
              Mettez à jour la valeur du paramètre ci-dessous.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="setting-value">Valeur</Label>
              <Input
                id="setting-value"
                value={editSettingValue}
                onChange={(e) => setEditSettingValue(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Annuler</Button>
            <Button onClick={handleUpdateSetting}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* User Action Dialog */}
      <Dialog open={showUserActionDialog} onOpenChange={setShowUserActionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {userActionType === 'suspend' ? 'Suspendre l\'utilisateur' :
               userActionType === 'delete' ? 'Supprimer l\'utilisateur' :
               userActionType === 'role' ? (
                 selectedRole === 'admin' ? 'Modifier le rôle Administrateur' : 'Modifier le rôle Fournisseur'
               ) : 'Action utilisateur'}
            </DialogTitle>
            <DialogDescription>
              {userActionType === 'suspend' ? 'Cette action suspendra temporairement l\'accès de l\'utilisateur au système.' :
               userActionType === 'delete' ? 'Cette action supprimera définitivement le compte de l\'utilisateur.' :
               userActionType === 'role' ? 'Modifier les permissions de l\'utilisateur.' :
               'Confirmez cette action.'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            {userActionType === 'delete' && (
              <div className="flex items-center p-3 bg-red-50 text-red-800 rounded-md mb-4">
                <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                <p className="text-sm">
                  Cette action est irréversible. Toutes les données associées à cet utilisateur seront supprimées.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUserActionDialog(false)}>Annuler</Button>
            <Button 
              variant={userActionType === 'delete' ? 'destructive' : 'default'}
              onClick={handleUserAction}
            >
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Admin;
