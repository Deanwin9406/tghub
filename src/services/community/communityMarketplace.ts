
import { supabase } from "@/integrations/supabase/client";
import { MarketplaceItem } from "@/types/community";

// Get marketplace items
export const getMarketplaceItems = async (communityId: string): Promise<MarketplaceItem[]> => {
  try {
    const { data, error } = await supabase
      .from("marketplace_items")
      .select("*")
      .eq("community_id", communityId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Format the items with seller info
    const formattedItems = await Promise.all(data.map(async (item) => {
      // Get seller profile
      const { data: sellerData, error: sellerError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", item.seller_id)
        .single();

      const sellerInfo = sellerError ? null : {
        first_name: sellerData?.first_name || "",
        last_name: sellerData?.last_name || "",
        avatar_url: sellerData?.avatar_url || null
      };

      return {
        ...item,
        seller: sellerInfo
      } as MarketplaceItem;
    }));

    return formattedItems;
  } catch (error) {
    console.error("Error fetching marketplace items:", error);
    throw error;
  }
};

// Create a marketplace item
export const createMarketplaceItem = async (itemData: {
  community_id: string;
  seller_id: string;
  title: string;
  description: string;
  price?: number;
  image_url?: string;
  category?: string;
}): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from("marketplace_items")
      .insert(itemData)
      .select()
      .single();

    if (error) throw error;
    return data.id;
  } catch (error) {
    console.error("Error creating marketplace item:", error);
    throw error;
  }
};
