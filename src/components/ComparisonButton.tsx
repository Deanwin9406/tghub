
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shuffle } from 'lucide-react';
import { useComparison } from '@/contexts/ComparisonContext';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const ComparisonButton = () => {
  const { comparisonList } = useComparison();
  const navigate = useNavigate();

  if (comparisonList.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          size="lg"
          className="px-6 shadow-lg"
          onClick={() => navigate('/compare')}
        >
          <Shuffle className="mr-2 h-4 w-4" />
          Comparer ({comparisonList.length})
        </Button>
      </motion.div>
    </AnimatePresence>
  );
};

export default ComparisonButton;
