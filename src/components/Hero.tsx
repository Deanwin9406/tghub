
import React from 'react';
import { motion } from 'framer-motion';
import SearchBar from './SearchBar';

const Hero = () => {
  return (
    <div className="relative h-[90vh] max-h-[800px] overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1560520031-3a4dc4e9de0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80")',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
      </div>
      
      {/* Content */}
      <div className="container mx-auto h-full flex flex-col justify-center px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-2xl"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Trouvez votre prochain chez-vous au Togo
          </h1>
          <p className="text-xl text-white/90 mb-8">
            Le premier marché immobilier taillé pour les Togolais locaux et de la diaspora
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="w-full max-w-4xl"
        >
          <SearchBar />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-12 grid grid-cols-3 gap-8 max-w-2xl"
        >
          <div className="text-center">
            <div className="bg-white/20 backdrop-blur-md rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-3">
              <span className="text-white text-xl font-bold">10k+</span>
            </div>
            <p className="text-white text-sm">Propriétés disponibles</p>
          </div>
          <div className="text-center">
            <div className="bg-white/20 backdrop-blur-md rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-3">
              <span className="text-white text-xl font-bold">500+</span>
            </div>
            <p className="text-white text-sm">Agents certifiés</p>
          </div>
          <div className="text-center">
            <div className="bg-white/20 backdrop-blur-md rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-3">
              <span className="text-white text-xl font-bold">98%</span>
            </div>
            <p className="text-white text-sm">Clients satisfaits</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;
