import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Upload, Check, AlertTriangle, FileText, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const KycVerification = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [idType, setIdType] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [idImage, setIdImage] = useState<File | null>(null);
  const [addressProof, setAddressProof] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verified' | 'rejected' | null>(null);
  const [notes, setNotes] = useState('');

  const idImageInputRef = useRef<HTMLInputElement>(null);
  const addressProofInputRef = useRef<HTMLInputElement>(null);

  const handleIdImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIdImage(e.target.files[0]);
    }
  };

  const handleAddressProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAddressProof(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!idType || !idNumber || !idImage || !addressProof) {
      toast({
        title: "Missing Information",
        description: "Please fill out all fields and upload required documents.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Upload ID Image
      const idImagePath = `kyc/${user?.id}/id_${Date.now()}.${idImage.name.split('.').pop()}`;
      const { error: idImageError } = await supabase.storage
        .from('avatars')
        .upload(idImagePath, idImage, {
          cacheControl: '3600',
          upsert: false
        });

      if (idImageError) {
        throw new Error(`ID Image Upload Error: ${idImageError.message}`);
      }

      const idImageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${idImagePath}`;

      // Upload Address Proof
      const addressProofPath = `kyc/${user?.id}/address_${Date.now()}.${addressProof.name.split('.').pop()}`;
      const { error: addressProofError } = await supabase.storage
        .from('avatars')
        .upload(addressProofPath, addressProof, {
          cacheControl: '3600',
          upsert: false
        });

      if (addressProofError) {
        throw new Error(`Address Proof Upload Error: ${addressProofError.message}`);
      }

      const addressProofUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${addressProofPath}`;

      // Save to DB
      const { error: dbError } = await supabase
        .from('kyc_verifications')
        .insert({
          user_id: user.id,
          id_type: idType,
          id_number: idNumber,
          id_image_url: idImageUrl,
          address_proof_url: addressProofUrl,
          status: 'pending',
          notes: notes,
        });

      if (dbError) {
        throw new Error(`Database Error: ${dbError.message}`);
      }

      toast({
        title: "Verification Submitted",
        description: "Your KYC verification has been submitted and is pending review.",
      });

      setVerificationStatus('pending');
    } catch (error: any) {
      console.error("KYC Submission Error:", error);
      toast({
        title: "Submission Error",
        description: error.message || "Failed to submit KYC verification. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const fetchVerificationStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('kyc_verifications')
        .select('status, notes')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error("Error fetching KYC status:", error);
        return;
      }

      setVerificationStatus(data?.status || null);
      setNotes(data?.notes || '');
    } catch (error) {
      console.error("Error fetching KYC status:", error);
    }
  };

  React.useEffect(() => {
    fetchVerificationStatus();
  }, [user]);

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge variant="secondary">verified</Badge>;
      case 'pending':
        return <Badge variant="default">pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive">rejected</Badge>;
      default:
        return <Badge variant="outline">unknown</Badge>;
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">KYC Verification</CardTitle>
            <CardDescription>Verify your identity to unlock full access to our platform.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {verificationStatus ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold">Verification Status:</h3>
                  {renderStatusBadge(verificationStatus)}
                </div>
                {notes && (
                  <div className="space-y-2">
                    <h4 className="text-md font-semibold">Notes:</h4>
                    <p className="text-muted-foreground">{notes}</p>
                  </div>
                )}
                {verificationStatus === 'rejected' && (
                  <Button onClick={() => {
                    setVerificationStatus(null);
                    setIdType('');
                    setIdNumber('');
                    setIdImage(null);
                    setAddressProof(null);
                    setNotes('');
                  }}>
                    Re-submit Verification
                  </Button>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="idType">ID Type</Label>
                  <RadioGroup defaultValue={idType} onValueChange={setIdType}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="passport" id="passport" className="peer h-4 w-4 border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground" />
                      <Label htmlFor="passport" className="cursor-pointer">Passport</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="drivers_license" id="drivers_license" className="peer h-4 w-4 border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground" />
                      <Label htmlFor="drivers_license" className="cursor-pointer">Driver's License</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="national_id" id="national_id" className="peer h-4 w-4 border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground" />
                      <Label htmlFor="national_id" className="cursor-pointer">National ID</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="idNumber">ID Number</Label>
                  <Input
                    type="text"
                    id="idNumber"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="idImage">ID Image</Label>
                  <Input
                    type="file"
                    id="idImage"
                    accept="image/*"
                    onChange={handleIdImageChange}
                    className="hidden"
                    ref={idImageInputRef}
                  />
                  <Button variant="outline" onClick={() => idImageInputRef.current?.click()}>
                    {idImage ? (
                      <div className="flex items-center">
                        <Check className="mr-2 h-4 w-4" />
                        <span>{idImage.name}</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Upload className="mr-2 h-4 w-4" />
                        <span>Upload ID Image</span>
                      </div>
                    )}
                  </Button>
                  {idImage && (
                    <aside className="flex items-center space-x-2 mt-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{idImage.name} - {(idImage.size / 1024).toFixed(2)} KB</span>
                    </aside>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="addressProof">Proof of Address</Label>
                  <Input
                    type="file"
                    id="addressProof"
                    accept="image/*, application/pdf"
                    onChange={handleAddressProofChange}
                    className="hidden"
                    ref={addressProofInputRef}
                  />
                  <Button variant="outline" onClick={() => addressProofInputRef.current?.click()}>
                    {addressProof ? (
                      <div className="flex items-center">
                        <Check className="mr-2 h-4 w-4" />
                        <span>{addressProof.name}</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Upload className="mr-2 h-4 w-4" />
                        <span>Upload Address Proof</span>
                      </div>
                    )}
                  </Button>
                  {addressProof && (
                    <aside className="flex items-center space-x-2 mt-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{addressProof.name} - {(addressProof.size / 1024).toFixed(2)} KB</span>
                    </aside>
                  )}
                </div>
                <Button type="submit" disabled={uploading}>
                  {uploading ? (
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      <span>Submitting...</span>
                    </div>
                  ) : (
                    "Submit Verification"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default KycVerification;
