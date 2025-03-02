
import React from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import Hero from '@/components/Hero';
import FeaturedProperties from '@/components/FeaturedProperties';
import { Button } from '@/components/ui/button';
import SearchBar from '@/components/SearchBar';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, MapPin, Home, Building, DollarSign } from 'lucide-react';

const Index = () => {
  return (
    <Layout>
      <Hero />
      
      <FeaturedProperties title="Propriétés à la une" type="featured" />
      
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">Comment ça marche</h2>
            <p className="text-muted-foreground text-lg">
              Trouvez facilement la propriété de vos rêves au Togo en quelques étapes simples
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true, margin: "-100px" }}
              className="bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Search size={24} className="text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Recherchez</h3>
              <p className="text-muted-foreground">
                Utilisez notre moteur de recherche avancé pour trouver la propriété qui correspond à vos critères.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true, margin: "-100px" }}
              className="bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Home size={24} className="text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Visitez</h3>
              <p className="text-muted-foreground">
                Contactez les agents pour organiser des visites réelles ou virtuelles des propriétés qui vous intéressent.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true, margin: "-100px" }}
              className="bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <DollarSign size={24} className="text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Achetez ou Louez</h3>
              <p className="text-muted-foreground">
                Finalisez la transaction en toute sécurité avec notre système de paiement protégé.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
      
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <h2 className="text-3xl font-bold mb-6">Vous souhaitez vendre ou louer votre propriété ?</h2>
              <p className="text-lg text-muted-foreground mb-8">
                TogoProp vous connecte avec des milliers d'acheteurs et locataires potentiels au Togo et à l'international.
              </p>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center mt-0.5 mr-3">
                    <ArrowRight size={14} className="text-primary" />
                  </div>
                  <span>Création d'annonce simple et rapide</span>
                </li>
                <li className="flex items-start">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center mt-0.5 mr-3">
                    <ArrowRight size={14} className="text-primary" />
                  </div>
                  <span>Accompagnement personnalisé par des experts</span>
                </li>
                <li className="flex items-start">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center mt-0.5 mr-3">
                    <ArrowRight size={14} className="text-primary" />
                  </div>
                  <span>Visibilité maximale auprès d'acheteurs qualifiés</span>
                </li>
              </ul>
              
              <Button size="lg" className="mt-2">
                Publier une annonce
              </Button>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true, margin: "-100px" }}
              className="rounded-2xl overflow-hidden shadow-xl"
            >
              <img 
                src="https://images.unsplash.com/photo-1560520031-3a4dc4e9de0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80" 
                alt="Agent immobilier"
                className="w-full h-auto"
              />
            </motion.div>
          </div>
        </div>
      </section>
      
      <section className="py-16 bg-gradient-to-r from-togo-green/90 to-togo-green/80 text-white">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Prêt à trouver votre prochain chez-vous ?</h2>
            <p className="text-lg text-white/90 mb-8">
              Plus de 10,000 propriétés vous attendent sur TogoProp
            </p>
            
            <div className="max-w-xl mx-auto">
              <SearchBar variant="minimal" className="bg-white/10 backdrop-blur-md border border-white/20" />
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
