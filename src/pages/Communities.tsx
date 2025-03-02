
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, CardContent, CardDescription, 
  CardFooter, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Users, MapPin, Plus, Search } from 'lucide-react';
import { getCommunities } from '@/services/community';

const Communities = () => {
  const [allCommunities, setAllCommunities] = useState([]);
  const [filteredCommunities, setFilteredCommunities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadCommunities = async () => {
      setIsLoading(true);
      try {
        const data = await getCommunities();
        setAllCommunities(data);
        setFilteredCommunities(data);
      } catch (error) {
        console.error('Error loading communities:', error);
        setError('Failed to load communities. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadCommunities();
  }, []);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (term === '') {
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
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCommunities.map(community => (
              <Card key={community.id} onClick={() => navigate(`/communities/${community.id}`)}>
                <CardHeader>
                  <CardTitle>{community.name}</CardTitle>
                  <CardDescription>{community.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <MapPin className="mr-2" />
                    <span>{community.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="mr-2" />
                    <span>{community.member_count} members</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>View Community</Button>
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
