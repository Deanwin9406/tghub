
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface KycRequirementCardProps {
  title: string;
  description: string;
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  fileName?: string;
}

const KycRequirementCard: React.FC<KycRequirementCardProps> = ({
  title,
  description,
  onUpload,
  fileName,
}) => {
  return (
    <Card className="border-dashed border-2 p-4">
      <CardContent className="p-0 space-y-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        
        <div className="flex flex-col items-center justify-center gap-2 p-4 bg-muted/50 rounded-md">
          <label htmlFor={`file-upload-${title}`} className="w-full">
            <div className="flex flex-col items-center justify-center gap-2 cursor-pointer">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm font-medium">
                {fileName ? 'Changer de fichier' : 'Ajouter un document'}
              </span>
              <input
                id={`file-upload-${title}`}
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={onUpload}
              />
            </div>
          </label>
          
          {fileName && (
            <div className="w-full mt-2 p-2 bg-background rounded border text-sm">
              <p className="truncate text-center">{fileName}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default KycRequirementCard;
