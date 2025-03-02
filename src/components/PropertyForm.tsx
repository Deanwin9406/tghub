
// Add 'isEditing' to the PropertyFormProps interface
interface PropertyFormProps {
  onSubmit: (data: {
    title: string;
    description: string;
    price: number;
    priceUnit: "XOF" | "USD" | "EUR";
    type: "apartment" | "house" | "villa" | "office" | "land" | "other";
    purpose: string;
    location: string;
    beds: number;
    baths: number;
    area: number;
    image: string;
    features: string[];
  }) => void;
  initialData?: any;
  propertyId?: string;
  isEditing?: boolean;
}
