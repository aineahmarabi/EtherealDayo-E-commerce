"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { ArrowLeft, Plus, Trash2, PlusCircle } from "lucide-react";
import { slugify } from "@/lib/utils";
import { ImageUploadZone } from "@/components/ui/ImageUploadZone";

type TempVariant = {
  id: string;
  size: string;
  concentration: "EDP" | "Parfum" | "Extrait" | "EDT";
  price: string;
  stock: string;
  sku: string;
};

export default function NewProductPage() {
  const router = useRouter();
  const brands = useQuery(api.brands.list);
  const createProduct = useMutation(api.products.create);
  const createVariant = useMutation(api.variants.create);
  const [loading, setLoading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);

  // Quick-add brand
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [brandForm, setBrandForm] = useState({ name: "", description: "" });
  const [brandSaving, setBrandSaving] = useState(false);
  const createBrand = useMutation(api.brands.create);

  const handleCreateBrand = async () => {
    if (!brandForm.name.trim()) return;
    setBrandSaving(true);
    try {
      const id = await createBrand({
        name: brandForm.name.trim(),
        slug: slugify(brandForm.name.trim()),
        description: brandForm.description.trim() || brandForm.name.trim(),
        order: 999,
      });
      setForm(prev => ({ ...prev, brandId: id }));
      setBrandForm({ name: "", description: "" });
      setShowBrandModal(false);
    } catch (err) {
      console.error(err);
      alert("Failed to create brand.");
    } finally {
      setBrandSaving(false);
    }
  };
  
  const [form, setForm] = useState({
    name: "",
    slug: "",
    brandId: "",
    audience: "unisex" as "her" | "him" | "unisex",
    family: "",
    notesTop: "",
    notesHeart: "",
    notesBase: "",
    perfumer: "",
    year: new Date().getFullYear().toString(),
    sillage: "3",
    longevity: "3",
    intensity: "3",
    story: "",
    isBestseller: false,
    status: "draft" as "active" | "draft",
    
    // Base Pricing & Inventory
    price: "",
    compareAtPrice: "",
    costPerItem: "",
    chargeTax: true,
    trackQuantity: true,
    stock: "0",
    sku: "",
    barcode: "",
    sellOutOfStock: false,
    
    // Shipping
    isPhysical: true,
    weight: "0.0",
    weightUnit: "g",
  });

  const [hasOptions, setHasOptions] = useState(false);
  const [variants, setVariants] = useState<TempVariant[]>([
    { id: "1", size: "50ml", concentration: "EDP", price: "", stock: "0", sku: "" }
  ]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleVariantChange = (id: string, field: keyof TempVariant, value: string) => {
    setVariants(prev => prev.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  const addVariant = () => {
    setVariants(prev => [...prev, { id: Math.random().toString(), size: "100ml", concentration: "EDP", price: "", stock: "0", sku: "" }]);
  };

  const removeVariant = (id: string) => {
    setVariants(prev => prev.filter(v => v.id !== id));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brands || !form.brandId) {
      alert("Please select a brand.");
      return;
    }
    
    if (hasOptions && variants.length === 0) {
      alert("Please add at least one variant.");
      return;
    }

    setLoading(true);
    try {
      const selectedBrand = brands.find((b) => b._id === form.brandId);
      if (!selectedBrand) throw new Error("Brand not found");

      // 1. Create Base Product
      const productId = await createProduct({
        name: form.name,
        slug: form.slug || form.name.toLowerCase().replace(/[\s\W-]+/g, "-"),
        brandId: selectedBrand._id,
        brandName: selectedBrand.name,
        audience: form.audience,
        family: form.family,
        notesTop: form.notesTop.split(",").map(n => n.trim()).filter(Boolean),
        notesHeart: form.notesHeart.split(",").map(n => n.trim()).filter(Boolean),
        notesBase: form.notesBase.split(",").map(n => n.trim()).filter(Boolean),
        perfumer: form.perfumer,
        year: parseInt(form.year) || new Date().getFullYear(),
        sillage: parseInt(form.sillage) || 3,
        longevity: parseInt(form.longevity) || 3,
        intensity: parseInt(form.intensity) || 3,
        story: form.story,
        images: uploadedUrls,
        isBestseller: form.isBestseller,
        publishedAt: Date.now(),
        status: form.status,
      });

      // 2. Create Variants
      if (hasOptions) {
        for (const v of variants) {
          await createVariant({
            productId,
            size: v.size,
            concentration: v.concentration,
            price: parseFloat(v.price) || 0,
            stock: parseInt(v.stock) || 0,
            sku: v.sku,
          });
        }
      } else {
        // Create default base variant using main form data
        await createVariant({
          productId,
          size: "Standard Size",
          concentration: "EDP",
          price: parseFloat(form.price) || 0,
          stock: parseInt(form.stock) || 0,
          sku: form.sku,
        });
      }

      router.push(`/admin/products/${productId}`);
    } catch (error) {
      console.error(error);
      alert("Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full bg-noir border border-gold/15 rounded-lg px-3 py-2 text-sm text-bone focus:border-gold/40 focus:outline-none transition-colors";
  const selectCls = "w-full bg-noir border border-gold/15 rounded-lg px-3 py-2 text-sm text-bone focus:border-gold/40 focus:outline-none transition-colors";
  const cardCls = "p-5 rounded-xl bg-white/[0.02] border border-gold/10 shadow-sm flex flex-col gap-4";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-4xl mx-auto w-full pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 sticky top-0 bg-ink/90 backdrop-blur-xl z-20 py-4 border-b border-gold/10 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 mb-2">
        <button type="button" onClick={() => router.back()} className="p-2 -ml-2 rounded-lg text-muted-text hover:text-bone transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-display text-xl text-bone flex-1">Add product</h1>
        <button type="button" onClick={() => router.back()} className="px-4 py-2 text-sm font-body text-bone hover:bg-white/5 rounded-lg transition-colors">
          Discard
        </button>
        <button type="submit" disabled={loading} className="px-5 py-2 bg-gold text-noir rounded-lg text-sm font-medium hover:bg-gold-soft transition-colors disabled:opacity-50">
          {loading ? "Saving..." : "Save"}
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        {/* Main Column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Title & Description */}
          <div className={cardCls}>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] text-bone font-body">Title</label>
              <input required name="name" value={form.name} onChange={handleChange} className={inputCls} placeholder="e.g. Baccarat Rouge 540" />
            </div>
            <div className="flex flex-col gap-1.5 mt-2">
              <label className="text-[13px] text-bone font-body">Description</label>
              <textarea name="story" value={form.story} onChange={handleChange} rows={8} className={inputCls + " resize-y leading-relaxed"} placeholder="Write a compelling story for this fragrance..." />
            </div>
          </div>

          {/* Media */}
          <div className={cardCls}>
            <h2 className="text-[15px] text-bone font-medium">Media</h2>
            <ImageUploadZone
              images={uploadedUrls}
              onChange={setUploadedUrls}
            />
          </div>

          {/* Category (Fragrance Profile) */}
          <div className={cardCls}>
            <h2 className="text-[15px] text-bone font-medium">Category</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] text-muted-text font-body">Olfactive Family</label>
                <input name="family" value={form.family} onChange={handleChange} className={inputCls} placeholder="e.g. Amber Floral" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] text-muted-text font-body">Perfumer</label>
                <input name="perfumer" value={form.perfumer} onChange={handleChange} className={inputCls} placeholder="e.g. Francis Kurkdjian" />
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-4 mt-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] text-muted-text font-body">Top Notes</label>
                <input name="notesTop" value={form.notesTop} onChange={handleChange} className={inputCls} placeholder="Saffron..." />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] text-muted-text font-body">Heart Notes</label>
                <input name="notesHeart" value={form.notesHeart} onChange={handleChange} className={inputCls} placeholder="Amberwood..." />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] text-muted-text font-body">Base Notes</label>
                <input name="notesBase" value={form.notesBase} onChange={handleChange} className={inputCls} placeholder="Fir Resin..." />
              </div>
            </div>
          </div>

          {/* Pricing */}
          {!hasOptions && (
            <div className={cardCls}>
              <h2 className="text-[15px] text-bone font-medium">Pricing</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] text-bone font-body">Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-text text-sm">KES</span>
                    <input type="number" name="price" value={form.price} onChange={handleChange} className={inputCls + " pl-12"} placeholder="0.00" />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] text-bone font-body">Compare-at price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-text text-sm">KES</span>
                    <input type="number" name="compareAtPrice" value={form.compareAtPrice} onChange={handleChange} className={inputCls + " pl-12"} placeholder="0.00" />
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-gold/10 grid grid-cols-2 gap-4 items-center">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] text-bone font-body">Cost per item</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-text text-sm">KES</span>
                    <input type="number" name="costPerItem" value={form.costPerItem} onChange={handleChange} className={inputCls + " pl-12"} placeholder="0.00" />
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer mt-6">
                  <input type="checkbox" name="chargeTax" checked={form.chargeTax} onChange={handleChange} className="w-4 h-4 accent-gold" />
                  <span className="text-[13px] text-bone font-body">Charge tax on this product</span>
                </label>
              </div>
            </div>
          )}

          {/* Inventory */}
          {!hasOptions && (
            <div className={cardCls}>
              <h2 className="text-[15px] text-bone font-medium">Inventory</h2>
              <label className="flex items-center gap-2 cursor-pointer mb-2">
                <input type="checkbox" name="trackQuantity" checked={form.trackQuantity} onChange={handleChange} className="w-4 h-4 accent-gold" />
                <span className="text-[13px] text-bone font-body">Track quantity</span>
              </label>
              <div className="grid grid-cols-2 gap-4 border-b border-gold/10 pb-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] text-bone font-body">Quantity</label>
                  <input type="number" name="stock" value={form.stock} onChange={handleChange} className={inputCls} placeholder="0" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] text-bone font-body">SKU (Stock Keeping Unit)</label>
                  <input name="sku" value={form.sku} onChange={handleChange} className={inputCls} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] text-bone font-body">Barcode (ISBN, UPC, GTIN, etc.)</label>
                  <input name="barcode" value={form.barcode} onChange={handleChange} className={inputCls} />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer mt-2">
                <input type="checkbox" name="sellOutOfStock" checked={form.sellOutOfStock} onChange={handleChange} className="w-4 h-4 accent-gold" />
                <span className="text-[13px] text-bone font-body">Continue selling when out of stock</span>
              </label>
            </div>
          )}

          {/* Shipping */}
          {!hasOptions && (
            <div className={cardCls}>
              <h2 className="text-[15px] text-bone font-medium">Shipping</h2>
              <label className="flex items-center gap-2 cursor-pointer mb-2">
                <input type="checkbox" name="isPhysical" checked={form.isPhysical} onChange={handleChange} className="w-4 h-4 accent-gold" />
                <span className="text-[13px] text-bone font-body">This is a physical product</span>
              </label>
              {form.isPhysical && (
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] text-bone font-body">Weight</label>
                    <div className="flex gap-2">
                      <input type="number" step="0.1" name="weight" value={form.weight} onChange={handleChange} className={inputCls} placeholder="0.0" />
                      <select name="weightUnit" value={form.weightUnit} onChange={handleChange} className={selectCls + " w-24"}>
                        <option value="kg">kg</option>
                        <option value="g">g</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Variants */}
          <div className={cardCls}>
            <h2 className="text-[15px] text-bone font-medium">Variants</h2>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={hasOptions} onChange={(e) => setHasOptions(e.target.checked)} className="w-4 h-4 accent-gold" />
              <span className="text-[13px] text-bone font-body">This product has options, like size or concentration</span>
            </label>
            
            {hasOptions && (
              <div className="mt-4 flex flex-col gap-4 border-t border-gold/10 pt-4">
                {variants.map((v, i) => (
                  <div key={v.id} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-3 flex flex-col gap-1">
                      <label className="text-[10px] uppercase tracking-wider text-muted-text">Size</label>
                      <input value={v.size} onChange={e => handleVariantChange(v.id, "size", e.target.value)} className={inputCls} placeholder="50ml" />
                    </div>
                    <div className="col-span-3 flex flex-col gap-1">
                      <label className="text-[10px] uppercase tracking-wider text-muted-text">Concentration</label>
                      <select value={v.concentration} onChange={e => handleVariantChange(v.id, "concentration", e.target.value)} className={selectCls}>
                        <option value="EDP">EDP</option>
                        <option value="Parfum">Parfum</option>
                        <option value="Extrait">Extrait</option>
                        <option value="EDT">EDT</option>
                      </select>
                    </div>
                    <div className="col-span-2 flex flex-col gap-1">
                      <label className="text-[10px] uppercase tracking-wider text-muted-text">Price</label>
                      <input type="number" value={v.price} onChange={e => handleVariantChange(v.id, "price", e.target.value)} className={inputCls} placeholder="0" />
                    </div>
                    <div className="col-span-2 flex flex-col gap-1">
                      <label className="text-[10px] uppercase tracking-wider text-muted-text">Stock</label>
                      <input type="number" value={v.stock} onChange={e => handleVariantChange(v.id, "stock", e.target.value)} className={inputCls} placeholder="0" />
                    </div>
                    <div className="col-span-1 flex flex-col gap-1">
                      <label className="text-[10px] uppercase tracking-wider text-muted-text">SKU</label>
                      <input value={v.sku} onChange={e => handleVariantChange(v.id, "sku", e.target.value)} className={inputCls} />
                    </div>
                    <div className="col-span-1 pb-2 flex justify-end">
                      <button type="button" onClick={() => removeVariant(v.id)} className="text-muted-text hover:text-dusty-rose p-1">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={addVariant} className="flex items-center gap-2 text-[13px] text-purple-400 hover:text-purple-300 mr-auto mt-2 font-body">
                  <Plus size={14} /> Add another option
                </button>
              </div>
            )}
          </div>

          {/* Search Engine Listing */}
          <div className={cardCls}>
            <h2 className="text-[15px] text-bone font-medium">Search engine listing</h2>
            <p className="text-[13px] text-muted-text font-body">Add a title and description to see how this product might appear in a search engine listing</p>
          </div>

        </div>

        {/* Right Sidebar */}
        <div className="flex flex-col gap-6">
          
          {/* Status */}
          <div className={cardCls}>
            <h2 className="text-[15px] text-bone font-medium">Status</h2>
            <select name="status" value={form.status} onChange={handleChange} className={selectCls}>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
            </select>
            <div className="mt-2 pt-4 border-t border-gold/10">
              <h3 className="text-[13px] text-bone font-body mb-2">Publishing</h3>
              <p className="text-[13px] text-muted-text font-body flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Online Store
              </p>
            </div>
          </div>

          {/* Product Organization */}
          <div className={cardCls}>
            <h2 className="text-[15px] text-bone font-medium">Product organization</h2>
            
            <div className="flex flex-col gap-1.5 mt-2">
              <label className="text-[13px] text-muted-text font-body">Type</label>
              <select name="audience" value={form.audience} onChange={handleChange} className={selectCls}>
                <option value="unisex">Unisex</option>
                <option value="her">For Her</option>
                <option value="him">For Him</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5 mt-2">
              <div className="flex items-center justify-between">
                <label className="text-[13px] text-muted-text font-body">Vendor (Brand) *</label>
                <button
                  type="button"
                  onClick={() => setShowBrandModal(!showBrandModal)}
                  className="flex items-center gap-1 text-[11px] text-purple-400 hover:text-purple-300 font-body transition-colors"
                >
                  <PlusCircle size={13} />
                  Add Brand
                </button>
              </div>
              {showBrandModal && (
                <div className="p-3 rounded-lg bg-purple-950/40 border border-purple-700/40 flex flex-col gap-2">
                  <input
                    value={brandForm.name}
                    onChange={e => setBrandForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="Brand name"
                    className={inputCls + " text-xs py-1.5"}
                  />
                  <input
                    value={brandForm.description}
                    onChange={e => setBrandForm(p => ({ ...p, description: e.target.value }))}
                    placeholder="Short description (optional)"
                    className={inputCls + " text-xs py-1.5"}
                  />
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setShowBrandModal(false)} className="flex-1 py-1.5 text-xs text-muted-text hover:text-bone font-body border border-gold/15 rounded-lg transition-colors">Cancel</button>
                    <button type="button" onClick={handleCreateBrand} disabled={brandSaving || !brandForm.name.trim()} className="flex-1 py-1.5 text-xs bg-purple-600/80 hover:bg-purple-600 text-white rounded-lg font-body transition-colors disabled:opacity-50">
                      {brandSaving ? "Saving…" : "Create Brand"}
                    </button>
                  </div>
                </div>
              )}
              <select required name="brandId" value={form.brandId} onChange={handleChange} className={selectCls}>
                <option value="">Select a brand</option>
                {brands?.map((b) => (
                  <option key={b._id} value={b._id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5 mt-2">
              <label className="text-[13px] text-muted-text font-body">Collections</label>
              <input disabled className={inputCls + " opacity-50"} placeholder="Search collections" />
            </div>

            <div className="flex flex-col gap-1.5 mt-2 pt-4 border-t border-gold/10">
              <label className="text-[13px] text-muted-text font-body">Tags</label>
              <label className="flex items-center gap-2 cursor-pointer mt-1">
                <input type="checkbox" name="isBestseller" checked={form.isBestseller} onChange={handleChange} className="w-4 h-4 accent-gold" />
                <span className="text-[13px] text-bone font-body">Bestseller</span>
              </label>
            </div>
          </div>

          {/* Theme template */}
          <div className={cardCls}>
            <h2 className="text-[15px] text-bone font-medium">Theme template</h2>
            <select disabled className={selectCls + " opacity-80"}>
              <option>Default product</option>
            </select>
          </div>
          
          {/* Performance Specs */}
          <div className={cardCls}>
            <h2 className="text-[15px] text-bone font-medium">Performance (1-5)</h2>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] text-muted-text font-body">Sillage</label>
                <input type="number" min="1" max="5" name="sillage" value={form.sillage} onChange={handleChange} className={inputCls} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] text-muted-text font-body">Longevity</label>
                <input type="number" min="1" max="5" name="longevity" value={form.longevity} onChange={handleChange} className={inputCls} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] text-muted-text font-body">Intensity</label>
                <input type="number" min="1" max="5" name="intensity" value={form.intensity} onChange={handleChange} className={inputCls} />
              </div>
            </div>
          </div>

        </div>
      </div>
    </form>
  );
}
