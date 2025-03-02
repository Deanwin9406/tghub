
import React, { useState, useEffect } from 'react';
import { fetchMarketplaceItems } from '@/services/communityService';
import { MarketplaceItem } from '@/types/community';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Plus, Search, Tag, MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDistanceToNow } from 'date-fns';

interface CommunityMarketplaceProps {
  communityId: string;
}

const CommunityMarketplace = ({ communityId }: CommunityMarketplaceProps) => {
  const { toast } = useToast();
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    const loadItems = async () => {
      try {
        const data = await fetchMarketplaceItems(communityId);
        setItems(data);
      } catch (error) {
        console.error("Failed to load marketplace items:", error);
        toast({
          title: "Failed to load items",
          description: "Could not load marketplace items. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadItems();
  }, [communityId, toast]);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = category === 'all' || item.category === category;
    return matchesSearch && matchesCategory;
  });

  // Extract unique categories
  const categories = ['all', ...new Set(items.map(item => item.category).filter(Boolean) as string[])];

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-pulse">Loading marketplace items...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Community Marketplace</h3>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          List Item
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search marketplace..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Marketplace Empty</h3>
          <p className="text-muted-foreground mb-4">
            There are no items listed in the marketplace yet.
          </p>
          <Button>List First Item</Button>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Items Found</h3>
          <p className="text-muted-foreground mb-4">
            No items match your current filters.
          </p>
          <Button variant="outline" onClick={() => {setSearchTerm(''); setCategory('all');}}>
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <MarketplaceItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};

interface MarketplaceItemCardProps {
  item: MarketplaceItem;
}

const MarketplaceItemCard = ({ item }: MarketplaceItemCardProps) => {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative aspect-square bg-muted">
        {item.image_url ? (
          <img 
            src={item.image_url} 
            alt={item.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        {item.category && (
          <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
            {item.category}
          </div>
        )}
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="line-clamp-1">{item.title}</CardTitle>
        <div className="flex items-center text-sm text-muted-foreground">
          Listed {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
        </div>
      </CardHeader>
      <CardContent className="pb-2 flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
        {item.price !== null && (
          <div className="mt-2 flex items-center">
            <Tag className="h-4 w-4 mr-1 text-muted-foreground" />
            <span className="font-medium">${item.price.toFixed(2)}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-2">
        <div className="w-full grid grid-cols-2 gap-2">
          <Button variant="outline" className="w-full">
            <MessageSquare className="h-4 w-4 mr-2" />
            Contact
          </Button>
          <Button className="w-full">View</Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default CommunityMarketplace;
