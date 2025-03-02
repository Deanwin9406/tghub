
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, AlertCircle } from 'lucide-react';

interface KycRequirementCardProps {
  title: string;
  description: string;
  isRequired: boolean;
  isCompleted: boolean;
  onAction: () => void;
  actionLabel: string;
}

const KycRequirementCard = ({
  title,
  description,
  isRequired,
  isCompleted,
  onAction,
  actionLabel
}: KycRequirementCardProps) => {
  return (
    <Card className={isCompleted ? "border-green-200 bg-green-50/30" : isRequired ? "border-amber-200" : ""}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          {isCompleted ? (
            <span className="bg-green-100 text-green-800 flex items-center px-2 py-1 rounded text-xs font-medium">
              <Check className="h-3 w-3 mr-1" /> Complété
            </span>
          ) : isRequired ? (
            <span className="bg-amber-100 text-amber-800 flex items-center px-2 py-1 rounded text-xs font-medium">
              <AlertCircle className="h-3 w-3 mr-1" /> Requis
            </span>
          ) : (
            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">
              Optionnel
            </span>
          )}
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {isCompleted ? (
          <div className="rounded-md bg-green-50 p-4 text-sm text-green-800">
            Cette vérification a été complétée avec succès.
          </div>
        ) : (
          <div className="rounded-md bg-amber-50 p-4 text-sm text-amber-800">
            {isRequired ? "Cette vérification est requise pour activer votre compte." : "Cette vérification est optionnelle mais recommandée."}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          variant={isCompleted ? "outline" : "default"} 
          className="w-full" 
          onClick={onAction}
          disabled={isCompleted}
        >
          {isCompleted ? "Déjà complété" : actionLabel}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default KycRequirementCard;
