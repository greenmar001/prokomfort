"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { ProductLike } from "@/types";

interface ProductGalleryProps {
    product: ProductLike;
}

function waImageUrl(productId: number, imageId: number, ext: string, size: "970" | "500x0" | "200x0" = "970") {
    const a = String(productId % 100).padStart(2, "0");
    const b = String(Math.floor(productId / 100) % 100).padStart(2, "0");
    return `https://pro-komfort.com/wa-data/public/shop/products/${a}/${b}/${productId}/images/${imageId}/${imageId}.${size}.${ext}`;
}

export default function ProductGallery({ product }: ProductGalleryProps) {
    // Normalize images list
    // If product.images is empty, we might try to construct one from image_id/ext if available
    let images = product.images || [];

    // If no images array but we have image_id, create a synthetic image object
    if (images.length === 0 && product.image_id && product.ext) {
        const mainImgUrl = waImageUrl(product.id, Number(product.image_id), String(product.ext).replace(".", ""));
        images = [{ url_big: mainImgUrl, url_thumb: mainImgUrl, url_crop: mainImgUrl }];
    }

    const [activeIndex, setActiveIndex] = useState(0);

    if (images.length === 0) {
        return (
            <div className="relative aspect-square w-full bg-white rounded-xl border border-gray-100 flex items-center justify-center mb-4 p-6 text-gray-300">
                Нет фото
            </div>
        );
    }

    const activeEnv = images[activeIndex];
    // prefer big > crop > thumb
    const mainSrc = activeEnv?.url_big || activeEnv?.url_crop || activeEnv?.url_thumb || "";

    const handleNext = () => {
        setActiveIndex((prev) => (prev + 1) % images.length);
    };

    const handlePrev = () => {
        setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <div>
            {/* Main Image */}
            <div className="relative aspect-square w-full bg-white rounded-xl border border-gray-100 flex items-center justify-center mb-4 p-6 group">
                {mainSrc ? (
                    <div className="relative w-full h-full">
                        <Image
                            src={mainSrc}
                            alt={product.name || "Product image"}
                            fill
                            className="object-contain"
                            priority
                        />

                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={(e) => { e.preventDefault(); handlePrev(); }}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-gray-400 hover:text-orange-500 opacity-0 group-hover:opacity-100 transition z-10"
                                >
                                    <ChevronRight className="rotate-180" size={18} />
                                </button>
                                <button
                                    onClick={(e) => { e.preventDefault(); handleNext(); }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-gray-400 hover:text-orange-500 opacity-0 group-hover:opacity-100 transition z-10"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="text-gray-300">Нет фото</div>
                )}
            </div>

            {/* Thumbs */}
            {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {images.map((img, i) => {
                        const thumbSrc = img.url_crop || img.url_thumb || img.url_big || "";
                        const isActive = i === activeIndex;
                        return (
                            <div
                                key={i}
                                onClick={() => setActiveIndex(i)}
                                className={`relative w-20 h-20 border rounded-lg flex-shrink-0 cursor-pointer p-1 transition-all ${isActive
                                        ? "border-blue-500 ring-1 ring-blue-500"
                                        : "border-gray-200 hover:border-gray-300 grayscale hover:grayscale-0"
                                    }`}
                            >
                                {thumbSrc && (
                                    <div className="relative w-full h-full">
                                        <Image
                                            src={thumbSrc}
                                            alt=""
                                            fill
                                            className="object-contain"
                                            sizes="80px"
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
