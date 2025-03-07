
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, CardContent, CardDescription, 
  CardFooter, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Users, MapPin, Plus } from 'lucide-react';
import { getCommunities } from '@/services/community';
import { Community } from '@/types/community';

const Communities = () => {
  const [allCommunities, setAllCommunities] = useState<Community[]>([]);
  const [filteredCommunities, setFilteredCommunities] = useState<Community[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadCommunities = async () => {
      setIsLoading(true);
      try {
        const data = await getCommunities();
        setAllCommunities(data || []);
        setFilteredCommunities(data || []);
      } catch (error) {
        console.error('Error loading communities:', error);
        setError('Failed to load communities. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadCommunities();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (!term) {
      setFilteredCommunities(allCommunities);
    } else {
      setFilteredCommunities(
        allCommunities.filter(community => 
          community.name.toLowerCase().includes(term)
        )
      );
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Communities</h1>
          <Button onClick={() => navigate('/create-community')}>
            <Plus className="mr-2" />
            Create Community
          </Button>
        </div>
        <Input 
          placeholder="Search communities..." 
          className="mb-4" 
          value={searchTerm}
          onChange={handleSearch}
        />
        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 p-4 text-center">{error}</div>
        ) : filteredCommunities.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground">
            <Users className="mx-auto h-12 w-12 mb-2" />
            <p>No communities found. Create a new one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCommunities.map(community => (
              <Card 
                key={community.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/communities/${community.id}`)}
              >
                <CardHeader>
                  <CardTitle>{community.name}</CardTitle>
                  <CardDescription>{community.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center mb-2">
                    <MapPin className="mr-2 h-4 w-4" />
                    <span>{community.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="mr-2 h-4 w-4" />
                    <span>{community.member_count} members</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="secondary" className="w-full">View Community</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Communities;
