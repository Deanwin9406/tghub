
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { KycRequirementCard } from '@/components/kyc/KycRequirementCard';

const KycVerification = () => {
  const { user, roles, hasCompletedKyc } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [idType, setIdType] = useState('national_id');
  const [idNumber, setIdNumber] = useState('');
  const [idProofFile, setIdProofFile] = useState<File | null>(null);
  const [addressProofFile, setAddressProofFile] = useState<File | null>(null);
  const [kycStatus, setKycStatus] = useState<'pending' | 'approved' | 'rejected' | null>(null);
  const [kycNotes, setKycNotes] = useState<string | null>(null);

  // Requirements based on the user's role
  const getUserRequirements = () => {
    // Base requirements for all users
    const baseRequirements = [
      { title: "Valid ID", description: "National ID, Passport, or Driver's License" },
      { title: "Proof of Address", description: "Utility bill, bank statement or official document (less than 3 months old)" }
    ];

    // Additional requirements based on role
    if (roles.includes('landlord')) {
      return [
        ...baseRequirements,
        { title: "Property Ownership Documents", description: "Title deed or property registration" }
      ];
    } else if (roles.includes('agent')) {
      return [
        ...baseRequirements,
        { title: "Business License", description: "Real estate license or business registration" }
      ];
    } else if (roles.includes('manager')) {
      return [
        ...baseRequirements,
        { title: "Professional Credentials", description: "Management certification or employment verification" }
      ];
    } else if (roles.includes('vendor')) {
      return [
        ...baseRequirements,
        { title: "Business Registration", description: "Business registration or trade license" }
      ];
    }

    return baseRequirements;
  };

  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You need to be logged in to complete KYC verification",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    // Check if user already has a KYC verification
    const fetchKycStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('kyc_verifications')
          .select('status, notes')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error("Error fetching KYC status:", error);
          return;
        }

        if (data) {
          setKycStatus(data.status as 'pending' | 'approved' | 'rejected');
          setKycNotes(data.notes);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchKycStatus();
  }, [user, navigate, toast]);

  const uploadFile = async (file: File, path: string) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${user!.id}/${path}/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('kyc-documents')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('kyc-documents')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You need to be logged in to complete KYC verification",
        variant: "destructive",
      });
      return;
    }

    if (!idProofFile || !addressProofFile) {
      toast({
        title: "Missing documents",
        description: "Please upload all required documents",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      setUploading(true);

      // Upload files and get URLs
      const idImageUrl = await uploadFile(idProofFile, 'id');
      const addressProofUrl = await uploadFile(addressProofFile, 'address');

      setUploading(false);

      // First check if the user already has a KYC verification
      const { data: existingKyc } = await supabase
        .from('kyc_verifications')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (existingKyc) {
        // Update existing KYC verification
        const { error: updateError } = await supabase
          .from('kyc_verifications')
          .update({
            id_type: idType,
            id_number: idNumber,
            id_image_url: idImageUrl,
            address_proof_url: addressProofUrl,
            status: 'pending' as 'pending' | 'approved' | 'rejected',
            notes: 'Resubmitted documents for verification'
          })
          .eq('id', existingKyc.id);

        if (updateError) {
          throw updateError;
        }
      } else {
        // Create new KYC verification
        const { error: insertError } = await supabase
          .from('kyc_verifications')
          .insert({
            user_id: user.id,
            id_type: idType,
            id_number: idNumber,
            id_image_url: idImageUrl,
            address_proof_url: addressProofUrl,
            status: 'pending' as 'pending' | 'approved' | 'rejected',
            notes: 'Documents submitted for verification'
          });

        if (insertError) {
          throw insertError;
        }
      }

      toast({
        title: "Verification submitted",
        description: "Your documents have been submitted for verification",
      });

      // Update local state
      setKycStatus('pending');
    } catch (error: any) {
      console.error("Error submitting KYC:", error);
      toast({
        title: "Submission failed",
        description: error.message || "There was an error submitting your verification",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusMessage = () => {
    switch (kycStatus) {
      case 'pending':
        return {
          title: "Verification in progress",
          description: "Your documents are being reviewed. This typically takes 1-3 business days.",
          variant: "default" as const
        };
      case 'approved':
        return {
          title: "Verification complete",
          description: "You have been successfully verified.",
          variant: "default" as const
        };
      case 'rejected':
        return {
          title: "Verification rejected",
          description: kycNotes || "Your verification was rejected. Please resubmit with the correct documents.",
          variant: "destructive" as const
        };
      default:
        return null;
    }
  };

  const statusMessage = getStatusMessage();

  return (
    <Layout>
      <div className="container max-w-4xl py-8">
        <h1 className="text-3xl font-bold mb-6">KYC Verification</h1>
        
        {statusMessage && (
          <Card className={`mb-8 ${kycStatus === 'rejected' ? 'border-red-400' : kycStatus === 'approved' ? 'border-green-400' : ''}`}>
            <CardHeader>
              <CardTitle>{statusMessage.title}</CardTitle>
              <CardDescription>{statusMessage.description}</CardDescription>
            </CardHeader>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {getUserRequirements().map((req, index) => (
            <KycRequirementCard 
              key={index}
              title={req.title}
              description={req.description}
            />
          ))}
        </div>

        {(kycStatus !== 'approved' && kycStatus !== 'pending') && (
          <Card>
            <CardHeader>
              <CardTitle>Submit Verification Documents</CardTitle>
              <CardDescription>
                Please upload clear and valid documents to complete your verification.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="idType">ID Type</Label>
                  <Select 
                    value={idType} 
                    onValueChange={setIdType}
                  >
                    <SelectTrigger id="idType" className="w-full">
                      <SelectValue placeholder="Select ID Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="national_id">National ID</SelectItem>
                      <SelectItem value="passport">Passport</SelectItem>
                      <SelectItem value="drivers_license">Driver's License</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="idNumber">ID Number</Label>
                  <Input
                    id="idNumber"
                    placeholder="Enter your ID number"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="idProof">ID Document (Photo or Scan)</Label>
                  <Input
                    id="idProof"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setIdProofFile(e.target.files?.[0] || null)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="addressProof">Proof of Address</Label>
                  <Input
                    id="addressProof"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setAddressProofFile(e.target.files?.[0] || null)}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Utility bill, bank statement or official document (less than 3 months old)
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={loading || uploading}>
                  {loading ? (uploading ? 'Uploading...' : 'Submitting...') : 'Submit Verification'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default KycVerification;
