import { PropertyType, ExtendedPropertyType } from '../types/property';

// Mock data for properties
export const mockProperties: ExtendedPropertyType[] = [
  {
    id: "1",
    title: "Modern Apartment in Downtown",
    price: 250000,
    property_type: "apartment",
    type: "apartment",
    status: "for-sale",
    address: "123 Main St",
    city: "New York",
    country: "USA",
    location: "Downtown",
    bedrooms: 2,
    bathrooms: 2,
    beds: 2,
    baths: 2,
    size_sqm: 85,
    main_image_url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
    amenities: ["pool", "gym", "parking"],
    description: "A beautiful modern apartment in the heart of downtown.",
    year_built: 2018,
    availability_date: "2023-08-01",
    featured: true,
    square_footage: 915,
    favorite: false,
    compareEnabled: false,
  },
  {
    id: "2",
    title: "Luxury Villa with Ocean View",
    price: 1500000,
    property_type: "villa",
    type: "villa",
    status: "for-sale",
    address: "456 Ocean Dr",
    city: "Miami",
    country: "USA",
    location: "Beachfront",
    bedrooms: 5,
    bathrooms: 4,
    beds: 5,
    baths: 4,
    size_sqm: 350,
    main_image_url: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2370&q=80",
    image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2370&q=80",
    amenities: ["private pool", "beach access", "gated community"],
    description: "An exquisite villa with breathtaking ocean views.",
    year_built: 2020,
    availability_date: "2023-09-15",
    featured: true,
    square_footage: 3767,
    favorite: false,
    compareEnabled: false,
  },
  {
    id: "3",
    title: "Charming Cottage in the Countryside",
    price: 450000,
    property_type: "house",
    type: "house",
    status: "for-sale",
    address: "789 Rural Ln",
    city: "London",
    country: "UK",
    location: "Countryside",
    bedrooms: 3,
    bathrooms: 2,
    beds: 3,
    baths: 2,
    size_sqm: 120,
    main_image_url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
    amenities: ["garden", "fireplace", "pet-friendly"],
    description: "A cozy cottage nestled in the serene countryside.",
    year_built: 1950,
    availability_date: "2023-10-01",
    featured: false,
    square_footage: 1292,
    favorite: false,
    compareEnabled: false,
  },
  {
    id: "4",
    title: "Spacious Loft in Trendy District",
    price: 600000,
    property_type: "apartment",
    type: "apartment",
    status: "for-sale",
    address: "101 Hipster Ave",
    city: "San Francisco",
    country: "USA",
    location: "Mission District",
    bedrooms: 1,
    bathrooms: 1,
    beds: 1,
    baths: 1,
    size_sqm: 70,
    main_image_url: "https://images.unsplash.com/photo-1600585154524-164729efcaaf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
    image: "https://images.unsplash.com/photo-1600585154524-164729efcaaf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
    amenities: ["balcony", "city view", "close to transit"],
    description: "A stylish loft in the heart of the trendy Mission District.",
    year_built: 2005,
    availability_date: "2023-11-15",
    featured: true,
    square_footage: 753,
    favorite: false,
    compareEnabled: false,
  },
  {
    id: "5",
    title: "Seaside Bungalow with Private Beach",
    price: 900000,
    property_type: "house",
    type: "house",
    status: "for-sale",
    address: "222 Coastal Hwy",
    city: "Sydney",
    country: "Australia",
    location: "Bondi Beach",
    bedrooms: 2,
    bathrooms: 1,
    beds: 2,
    baths: 1,
    size_sqm: 90,
    main_image_url: "https://images.unsplash.com/photo-1571055195244-9479e5739541?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
    image: "https://images.unsplash.com/photo-1571055195244-9479e5739541?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
    amenities: ["beach access", "ocean view", "outdoor shower"],
    description: "A charming bungalow with direct access to Bondi Beach.",
    year_built: 1980,
    availability_date: "2023-12-01",
    featured: false,
    square_footage: 969,
    favorite: false,
    compareEnabled: false,
  },
];

export default mockProperties;
