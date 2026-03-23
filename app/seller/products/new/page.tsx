'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { CATEGORIES } from '@/lib/categories';
import { moderateContent } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { FileUpload } from '@/components/file-upload';
import { ImageUpload } from '@/components/image-upload';
import { AlertTriangle, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';

const FILE_TYPE_OPTIONS = [
  { value: 'pdf', label: 'PDF Document' },
  { value: 'docx', label: 'Word Document (.docx)' },
  { value: 'pptx', label: 'PowerPoint (.pptx)' },
  { value: 'zip', label: 'ZIP Archive' },
  { value: 'png', label: 'PNG Image' },
  { value: 'jpg', label: 'JPG Image' },
  { value: 'psd', label: 'Photoshop (.psd)' },
  { value: 'ai', label: 'Illustrator (.ai)' },
  { value: 'mp4', label: 'Video (.mp4)' },
  { value: 'mov', label: 'Video (.mov)' },
  { value: 'other', label: 'Other' },
];

const CATEGORY_OPTIONS = CATEGORIES.map((c) => ({ value: c.slug, label: c.name }));

interface FormErrors {
  title?: string;
  description?: string;
  price?: string;
  category?: string;
  file_type?: string;
  product_file?: string;
  preview_images?: string;
  moderation?: string;
  general?: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priceDisplay, setPriceDisplay] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [fileType, setFileType] = useState('');
  const [productFile, setProductFile] = useState<File | null>(null);
  const [previewImages, setPreviewImages] = useState<File[]>([]);

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function validate(): boolean {
    const newErrors: FormErrors = {};

    if (!title.trim()) newErrors.title = 'Title is required';
    else if (title.trim().length < 5) newErrors.title = 'Title must be at least 5 characters';

    if (!description.trim()) newErrors.description = 'Description is required';
    else if (description.trim().length < 20)
      newErrors.description = 'Description must be at least 20 characters';

    const priceNum = parseFloat(priceDisplay);
    if (!priceDisplay) newErrors.price = 'Price is required';
    else if (isNaN(priceNum) || priceNum < 0) newErrors.price = 'Enter a valid price';
    else if (priceNum > 0 && priceNum < 0.5) newErrors.price = 'Minimum price is $0.50';

    if (!category) newErrors.category = 'Please select a category';
    if (!fileType) newErrors.file_type = 'Please select a file type';
    if (!productFile) newErrors.product_file = 'Please upload a product file';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validate()) return;

    // Moderation check
    const { passed, flaggedTerms } = moderateContent(`${title} ${description}`);
    if (!passed) {
      setErrors({
        moderation: `Content contains flagged terms: ${flaggedTerms.join(', ')}. Please revise and try again.`,
      });
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        router.push('/login?redirect=/seller/products/new');
        return;
      }

      const timestamp = Date.now();
      const safeTitle = title.trim().toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 40);

      // Upload product file
      setUploadProgress('Uploading product file…');
      const fileExt = productFile!.name.split('.').pop();
      const filePath = `${authUser.id}/${timestamp}-${safeTitle}.${fileExt}`;
      const { error: fileUploadError } = await supabase.storage
        .from('products')
        .upload(filePath, productFile!, { upsert: false });

      if (fileUploadError) throw new Error(`File upload failed: ${fileUploadError.message}`);

      const { data: fileUrlData } = supabase.storage.from('products').getPublicUrl(filePath);
      const fileUrl = fileUrlData.publicUrl;

      // Upload preview images
      const previewUrls: string[] = [];
      if (previewImages.length > 0) {
        setUploadProgress('Uploading preview images…');
        for (let i = 0; i < previewImages.length; i++) {
          const img = previewImages[i];
          const imgExt = img.name.split('.').pop();
          const imgPath = `${authUser.id}/${timestamp}-${safeTitle}-preview-${i}.${imgExt}`;
          const { error: imgError } = await supabase.storage
            .from('previews')
            .upload(imgPath, img, { upsert: false });

          if (imgError) throw new Error(`Image upload failed: ${imgError.message}`);

          const { data: imgUrlData } = supabase.storage.from('previews').getPublicUrl(imgPath);
          previewUrls.push(imgUrlData.publicUrl);
        }
      }

      // Save product record
      setUploadProgress('Saving product…');
      const priceCents = Math.round(parseFloat(priceDisplay) * 100);

      const { error: insertError } = await supabase.from('products').insert({
        seller_id: authUser.id,
        title: title.trim(),
        description: description.trim(),
        price_cents: priceCents,
        category,
        subcategory: subcategory.trim() || null,
        file_url: fileUrl,
        file_type: fileType,
        preview_images: previewUrls,
        status: 'draft',
      });

      if (insertError) throw new Error(insertError.message);

      setSuccess(true);
      setTimeout(() => router.push('/seller'), 1500);
    } catch (err: any) {
      setErrors({ general: err.message ?? 'Something went wrong. Please try again.' });
    } finally {
      setSubmitting(false);
      setUploadProgress(null);
    }
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-[#1e293b]">Product created!</h2>
        <p className="text-gray-500 mt-1 text-sm">Redirecting to your dashboard…</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/seller"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1e293b] transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>
        <h1 className="text-2xl font-bold text-[#1e293b]">New Product</h1>
        <p className="text-sm text-gray-500 mt-1">
          Fill out the details below. Products start as drafts — activate them when ready.
        </p>
      </div>

      {/* Moderation / general errors */}
      {(errors.moderation || errors.general) && (
        <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
          <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{errors.moderation ?? errors.general}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info card */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <h2 className="text-base font-semibold text-[#1e293b]">Basic Information</h2>

          <Input
            id="title"
            label="Product Title"
            placeholder="e.g. CBT Thought Record Worksheet Bundle"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={errors.title}
            maxLength={100}
          />

          <Textarea
            id="description"
            label="Description"
            placeholder="Describe what's included, which populations it's best for, and how clinicians can use it…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            error={errors.description}
            className="min-h-[140px]"
            maxLength={2000}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="price"
              label="Price (USD)"
              type="number"
              placeholder="0.00"
              min="0"
              step="0.01"
              value={priceDisplay}
              onChange={(e) => setPriceDisplay(e.target.value)}
              error={errors.price}
            />
            <Select
              id="file_type"
              label="File Type"
              options={FILE_TYPE_OPTIONS}
              placeholder="Select file type"
              value={fileType}
              onChange={(e) => setFileType(e.target.value)}
              error={errors.file_type}
            />
          </div>
        </div>

        {/* Categorisation card */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <h2 className="text-base font-semibold text-[#1e293b]">Categorisation</h2>

          <Select
            id="category"
            label="Category"
            options={CATEGORY_OPTIONS}
            placeholder="Select a category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            error={errors.category}
          />

          <Input
            id="subcategory"
            label="Subcategory (optional)"
            placeholder="e.g. Adolescent, Group Therapy, Telehealth…"
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
          />
        </div>

        {/* Files card */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-5">
          <h2 className="text-base font-semibold text-[#1e293b]">Files</h2>

          <div>
            <FileUpload
              label="Product File *"
              onFileSelect={(file) => {
                setProductFile(file);
                setErrors((prev) => ({ ...prev, product_file: undefined }));
              }}
              maxSize={100 * 1024 * 1024}
            />
            {errors.product_file && (
              <p className="mt-1 text-sm text-red-600">{errors.product_file}</p>
            )}
          </div>

          <ImageUpload
            onImagesSelect={(files) => {
              setPreviewImages(files);
              setErrors((prev) => ({ ...prev, preview_images: undefined }));
            }}
            maxFiles={5}
          />
          {errors.preview_images && (
            <p className="text-sm text-red-600">{errors.preview_images}</p>
          )}
        </div>

        {/* Upload progress */}
        {uploadProgress && (
          <div className="flex items-center gap-2 text-sm text-[#1e293b] bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
            <div className="h-4 w-4 border-2 border-[#1e293b] border-t-transparent rounded-full animate-spin flex-shrink-0" />
            {uploadProgress}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 pb-6">
          <Link href="/seller">
            <Button type="button" variant="ghost">
              Cancel
            </Button>
          </Link>
          <Button type="submit" loading={submitting} disabled={submitting}>
            {submitting ? 'Creating…' : 'Create Product'}
          </Button>
        </div>
      </form>
    </div>
  );
}
