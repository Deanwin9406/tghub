
import { PropertyType } from '../components/PropertyCard';

const mockProperties: PropertyType[] = [
  {
    id: "1",
    title: "Villa moderne avec piscine",
    price: 75000000,
    priceUnit: "XOF",
    type: "house",
    purpose: "sale",
    location: "Lomé, Agbalépédogan",
    beds: 4,
    baths: 3,
    area: 250,
    image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=880&q=80",
    featured: true
  },
  {
    id: "2",
    title: "Appartement de standing",
    price: 350000,
    priceUnit: "XOF",
    type: "apartment",
    purpose: "rent",
    location: "Lomé, Adidogomé",
    beds: 2,
    baths: 2,
    area: 100,
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=880&q=80",
  },
  {
    id: "3",
    title: "Terrain constructible",
    price: 15000000,
    priceUnit: "XOF",
    type: "land",
    purpose: "sale",
    location: "Tsévié",
    area: 600,
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1032&q=80",
    new: true
  },
  {
    id: "4",
    title: "Maison familiale avec jardin",
    price: 45000000,
    priceUnit: "XOF",
    type: "house",
    purpose: "sale",
    location: "Lomé, Agoè",
    beds: 3,
    baths: 2,
    area: 180,
    image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80"
  },
  {
    id: "5",
    title: "Espace bureau moderne",
    price: 550000,
    priceUnit: "XOF",
    type: "commercial",
    purpose: "rent",
    location: "Lomé, Centre-ville",
    area: 120,
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1469&q=80"
  },
  {
    id: "6",
    title: "Villa de luxe avec vue sur mer",
    price: 150000000,
    priceUnit: "XOF",
    type: "house",
    purpose: "sale",
    location: "Aneho",
    beds: 5,
    baths: 4,
    area: 350,
    image: "https://images.unsplash.com/photo-1628744448840-55bdb2497bd4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    featured: true
  }
];

export default mockProperties;
