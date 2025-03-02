
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Check, CheckCircle, Clock, Upload, X } from 'lucide-react';

enum VerificationStatus {
  NOT_STARTED = 'not_started',
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected'
}

interface VerificationStep {
  id: string;
  name: string;
  status: VerificationStatus;
  description: string;
}

const KycVerification = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('personal');
  const [personalInfo, setPersonalInfo] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    nationality: '',
    idType: 'national_id',
    idNumber: '',
  });
  const [addressInfo, setAddressInfo] = useState({
    street: '',
    city: '',
    region: '',
    postalCode: '',
    country: 'Ghana',
  });
  const [uploadedFiles, setUploadedFiles] = useState<{[key: string]: File | null}>({
    idFront: null,
    idBack: null,
    selfie: null,
    proofOfAddress: null
  });

  const [verificationSteps, setVerificationSteps] = useState<VerificationStep[]>([
    {
      id: 'personal_info',
      name: 'Personal Information',
      status: VerificationStatus.NOT_STARTED,
      description: 'Basic information for your identity verification'
    },
    {
      id: 'address_verification',
      name: 'Address Verification',
      status: VerificationStatus.NOT_STARTED,
      description: 'Verify your current residence address'
    },
    {
      id: 'document_upload',
      name: 'Document Upload',
      status: VerificationStatus.NOT_STARTED,
      description: 'Upload required identification documents'
    },
    {
      id: 'final_review',
      name: 'Review & Submit',
      status: VerificationStatus.NOT_STARTED,
      description: 'Review and confirm your information'
    }
  ]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, fileType: string) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setUploadedFiles(prev => ({
        ...prev,
        [fileType]: file
      }));
      
      toast({
        title: "File uploaded",
        description: `${file.name} has been uploaded successfully.`
      });
    }
  };

  const updateStepStatus = (stepId: string, newStatus: VerificationStatus) => {
    setVerificationSteps(steps => 
      steps.map(step => 
        step.id === stepId ? { ...step, status: newStatus } : step
      )
    );
  };

  const handleNextStep = () => {
    if (activeTab === 'personal') {
      updateStepStatus('personal_info', VerificationStatus.VERIFIED);
      setActiveTab('address');
    } else if (activeTab === 'address') {
      updateStepStatus('address_verification', VerificationStatus.VERIFIED);
      setActiveTab('documents');
    } else if (activeTab === 'documents') {
      updateStepStatus('document_upload', VerificationStatus.VERIFIED);
      setActiveTab('review');
    }
  };

  const handlePreviousStep = () => {
    if (activeTab === 'address') {
      setActiveTab('personal');
    } else if (activeTab === 'documents') {
      setActiveTab('address');
    } else if (activeTab === 'review') {
      setActiveTab('documents');
    }
  };

  const handleSubmit = () => {
    updateStepStatus('final_review', VerificationStatus.PENDING);
    
    // All steps now showing as pending
    setVerificationSteps(steps => 
      steps.map(step => ({ ...step, status: VerificationStatus.PENDING }))
    );
    
    toast({
      title: "Verification Submitted",
      description: "Your KYC verification has been submitted and is under review."
    });
    
    // Navigate to dashboard or verification status page
    setTimeout(() => {
      navigate('/dashboard');
    }, 2000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, section: 'personal' | 'address') => {
    const { name, value } = e.target;
    
    if (section === 'personal') {
      setPersonalInfo(prev => ({ ...prev, [name]: value }));
    } else {
      setAddressInfo(prev => ({ ...prev, [name]: value }));
    }
  };

  const renderStatusBadge = (status: VerificationStatus) => {
    switch (status) {
      case VerificationStatus.NOT_STARTED:
        return <Badge variant="outline" className="ml-auto">Not Started</Badge>;
      case VerificationStatus.PENDING:
        return <Badge variant="secondary" className="ml-auto">
          <Clock className="h-3 w-3 mr-1" /> Pending
        </Badge>;
      case VerificationStatus.VERIFIED:
        return <Badge variant="success" className="ml-auto bg-green-500 hover:bg-green-600">
          <CheckCircle className="h-3 w-3 mr-1" /> Verified
        </Badge>;
      case VerificationStatus.REJECTED:
        return <Badge variant="destructive" className="ml-auto">
          <X className="h-3 w-3 mr-1" /> Rejected
        </Badge>;
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">KYC Verification</h1>
          <p className="text-muted-foreground mt-2">
            Complete your identity verification to unlock all platform features
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Verification Steps</CardTitle>
                <CardDescription>Complete all steps to verify your identity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {verificationSteps.map((step, index) => (
                    <div 
                      key={step.id} 
                      className={`flex items-center p-3 rounded-md cursor-pointer ${
                        activeTab === 'personal' && index === 0 || 
                        activeTab === 'address' && index === 1 || 
                        activeTab === 'documents' && index === 2 || 
                        activeTab === 'review' && index === 3 
                          ? 'bg-muted' 
                          : ''
                      }`}
                      onClick={() => {
                        if (index === 0) setActiveTab('personal');
                        else if (index === 1) setActiveTab('address');
                        else if (index === 2) setActiveTab('documents');
                        else if (index === 3) setActiveTab('review');
                      }}
                    >
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-3">
                        {index + 1}
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-medium text-sm">{step.name}</h4>
                        <p className="text-xs text-muted-foreground">{step.description}</p>
                      </div>
                      {renderStatusBadge(step.status)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="personal">Personal Info</TabsTrigger>
                <TabsTrigger value="address">Address</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="review">Review</TabsTrigger>
              </TabsList>
              
              <TabsContent value="personal">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Provide your basic identification information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input 
                          id="firstName" 
                          name="firstName"
                          value={personalInfo.firstName}
                          onChange={(e) => handleInputChange(e, 'personal')}
                          placeholder="Enter your first name" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input 
                          id="lastName" 
                          name="lastName"
                          value={personalInfo.lastName}
                          onChange={(e) => handleInputChange(e, 'personal')}
                          placeholder="Enter your last name" 
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="dateOfBirth">Date of Birth</Label>
                        <Input 
                          id="dateOfBirth" 
                          name="dateOfBirth"
                          type="date" 
                          value={personalInfo.dateOfBirth}
                          onChange={(e) => handleInputChange(e, 'personal')}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nationality">Nationality</Label>
                        <Input 
                          id="nationality" 
                          name="nationality"
                          value={personalInfo.nationality}
                          onChange={(e) => handleInputChange(e, 'personal')}
                          placeholder="Enter your nationality" 
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>ID Type</Label>
                      <RadioGroup 
                        defaultValue={personalInfo.idType}
                        onValueChange={(value) => setPersonalInfo(prev => ({...prev, idType: value}))}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="national_id" id="national_id" />
                          <Label htmlFor="national_id">National ID</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="passport" id="passport" />
                          <Label htmlFor="passport">Passport</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="drivers_license" id="drivers_license" />
                          <Label htmlFor="drivers_license">Driver's License</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="idNumber">ID Number</Label>
                      <Input 
                        id="idNumber" 
                        name="idNumber"
                        value={personalInfo.idNumber}
                        onChange={(e) => handleInputChange(e, 'personal')}
                        placeholder="Enter your ID number" 
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button onClick={handleNextStep}>Next Step</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="address">
                <Card>
                  <CardHeader>
                    <CardTitle>Address Verification</CardTitle>
                    <CardDescription>Provide your current residential address</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="street">Street Address</Label>
                      <Input 
                        id="street" 
                        name="street"
                        value={addressInfo.street}
                        onChange={(e) => handleInputChange(e, 'address')}
                        placeholder="Enter your street address" 
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input 
                          id="city" 
                          name="city"
                          value={addressInfo.city}
                          onChange={(e) => handleInputChange(e, 'address')}
                          placeholder="Enter your city" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="region">Region/State</Label>
                        <Input 
                          id="region" 
                          name="region"
                          value={addressInfo.region}
                          onChange={(e) => handleInputChange(e, 'address')}
                          placeholder="Enter your region or state" 
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="postalCode">Postal Code</Label>
                        <Input 
                          id="postalCode" 
                          name="postalCode"
                          value={addressInfo.postalCode}
                          onChange={(e) => handleInputChange(e, 'address')}
                          placeholder="Enter your postal code" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input 
                          id="country"
                          name="country" 
                          value={addressInfo.country}
                          onChange={(e) => handleInputChange(e, 'address')}
                          placeholder="Enter your country" 
                          disabled
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={handlePreviousStep}>Previous</Button>
                    <Button onClick={handleNextStep}>Next Step</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="documents">
                <Card>
                  <CardHeader>
                    <CardTitle>Document Upload</CardTitle>
                    <CardDescription>Upload the required identification documents</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="idFront">ID Front Side</Label>
                      <div className="border border-dashed rounded-md p-6 text-center">
                        {uploadedFiles.idFront ? (
                          <div className="flex items-center justify-center space-x-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <span className="text-sm">{uploadedFiles.idFront.name}</span>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setUploadedFiles(prev => ({...prev, idFront: null}))}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground mb-2">
                              Click to upload or drag and drop
                            </p>
                            <Input 
                              id="idFront" 
                              type="file" 
                              className="hidden"
                              onChange={(e) => handleFileUpload(e, 'idFront')}
                              accept="image/*,.pdf"
                            />
                            <Button 
                              variant="outline" 
                              onClick={() => document.getElementById('idFront')?.click()}
                            >
                              Select File
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="idBack">ID Back Side</Label>
                      <div className="border border-dashed rounded-md p-6 text-center">
                        {uploadedFiles.idBack ? (
                          <div className="flex items-center justify-center space-x-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <span className="text-sm">{uploadedFiles.idBack.name}</span>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setUploadedFiles(prev => ({...prev, idBack: null}))}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground mb-2">
                              Click to upload or drag and drop
                            </p>
                            <Input 
                              id="idBack" 
                              type="file" 
                              className="hidden"
                              onChange={(e) => handleFileUpload(e, 'idBack')}
                              accept="image/*,.pdf"
                            />
                            <Button 
                              variant="outline" 
                              onClick={() => document.getElementById('idBack')?.click()}
                            >
                              Select File
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="selfie">Selfie with ID</Label>
                      <div className="border border-dashed rounded-md p-6 text-center">
                        {uploadedFiles.selfie ? (
                          <div className="flex items-center justify-center space-x-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <span className="text-sm">{uploadedFiles.selfie.name}</span>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setUploadedFiles(prev => ({...prev, selfie: null}))}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground mb-2">
                              Click to upload or drag and drop
                            </p>
                            <Input 
                              id="selfie" 
                              type="file" 
                              className="hidden"
                              onChange={(e) => handleFileUpload(e, 'selfie')}
                              accept="image/*"
                            />
                            <Button 
                              variant="outline" 
                              onClick={() => document.getElementById('selfie')?.click()}
                            >
                              Select File
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="proofOfAddress">Proof of Address</Label>
                      <p className="text-xs text-muted-foreground mb-2">
                        Upload a utility bill, bank statement, or official letter (not older than 3 months)
                      </p>
                      <div className="border border-dashed rounded-md p-6 text-center">
                        {uploadedFiles.proofOfAddress ? (
                          <div className="flex items-center justify-center space-x-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <span className="text-sm">{uploadedFiles.proofOfAddress.name}</span>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setUploadedFiles(prev => ({...prev, proofOfAddress: null}))}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground mb-2">
                              Click to upload or drag and drop
                            </p>
                            <Input 
                              id="proofOfAddress" 
                              type="file" 
                              className="hidden"
                              onChange={(e) => handleFileUpload(e, 'proofOfAddress')}
                              accept="image/*,.pdf"
                            />
                            <Button 
                              variant="outline" 
                              onClick={() => document.getElementById('proofOfAddress')?.click()}
                            >
                              Select File
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={handlePreviousStep}>Previous</Button>
                    <Button onClick={handleNextStep}>Next Step</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="review">
                <Card>
                  <CardHeader>
                    <CardTitle>Review & Submit</CardTitle>
                    <CardDescription>
                      Review your information before submitting
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium">Full Name</p>
                            <p className="text-sm text-muted-foreground">
                              {personalInfo.firstName} {personalInfo.lastName}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Date of Birth</p>
                            <p className="text-sm text-muted-foreground">
                              {personalInfo.dateOfBirth || 'Not provided'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Nationality</p>
                            <p className="text-sm text-muted-foreground">
                              {personalInfo.nationality || 'Not provided'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">ID Information</p>
                            <p className="text-sm text-muted-foreground">
                              {personalInfo.idType === 'national_id' ? 'National ID' : 
                               personalInfo.idType === 'passport' ? 'Passport' : 
                               personalInfo.idType === 'drivers_license' ? "Driver's License" : 'Not provided'}: {personalInfo.idNumber || 'Not provided'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Address Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium">Street Address</p>
                            <p className="text-sm text-muted-foreground">
                              {addressInfo.street || 'Not provided'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">City</p>
                            <p className="text-sm text-muted-foreground">
                              {addressInfo.city || 'Not provided'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Region/State</p>
                            <p className="text-sm text-muted-foreground">
                              {addressInfo.region || 'Not provided'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Country & Postal Code</p>
                            <p className="text-sm text-muted-foreground">
                              {addressInfo.country}, {addressInfo.postalCode || 'No postal code'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Uploaded Documents</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium">ID Front Side</p>
                            <p className="text-sm text-muted-foreground flex items-center">
                              {uploadedFiles.idFront ? (
                                <>
                                  <Check className="h-4 w-4 text-green-500 mr-1" />
                                  {uploadedFiles.idFront.name}
                                </>
                              ) : (
                                'Not uploaded'
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">ID Back Side</p>
                            <p className="text-sm text-muted-foreground flex items-center">
                              {uploadedFiles.idBack ? (
                                <>
                                  <Check className="h-4 w-4 text-green-500 mr-1" />
                                  {uploadedFiles.idBack.name}
                                </>
                              ) : (
                                'Not uploaded'
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Selfie with ID</p>
                            <p className="text-sm text-muted-foreground flex items-center">
                              {uploadedFiles.selfie ? (
                                <>
                                  <Check className="h-4 w-4 text-green-500 mr-1" />
                                  {uploadedFiles.selfie.name}
                                </>
                              ) : (
                                'Not uploaded'
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Proof of Address</p>
                            <p className="text-sm text-muted-foreground flex items-center">
                              {uploadedFiles.proofOfAddress ? (
                                <>
                                  <Check className="h-4 w-4 text-green-500 mr-1" />
                                  {uploadedFiles.proofOfAddress.name}
                                </>
                              ) : (
                                'Not uploaded'
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-muted p-4 rounded-md">
                        <p className="text-sm">
                          By clicking "Submit Verification", you confirm that all information provided is accurate and authentic.
                          False information may result in account termination.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={handlePreviousStep}>Previous</Button>
                    <Button onClick={handleSubmit}>Submit Verification</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default KycVerification;
