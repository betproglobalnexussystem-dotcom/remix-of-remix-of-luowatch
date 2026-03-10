import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import BannerSkeleton from "./BannerSkeleton";
import { subscribeCarousels, FireCarousel } from "@/lib/carousels";

const BannerSlider = () => {
  const [carousels, setCarousels] = useState<FireCarousel[]>([]);
  const [loading, setLoading] = useState(true);
  const autoplayPlugin = useRef(Autoplay({ delay: 4000, stopOnInteraction: false }));

  useEffect(() => {
    const unsub = subscribeCarousels((data) => {
      setCarousels(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  if (loading) return <BannerSkeleton />;
  if (carousels.length === 0) return null;

  return (
    <div className="relative mb-4 -mx-3 md:mx-0">
      <Carousel
        opts={{ loop: true, align: "start" }}
        plugins={[autoplayPlugin.current]}
        className="w-full"
      >
        <CarouselContent className="-ml-0">
          {carousels.map((item) => (
            <CarouselItem key={item.id} className="pl-0">
              {item.linkUrl ? (
                <Link to={item.linkUrl} className="relative block rounded overflow-hidden cursor-pointer group">
                  <img src={item.imageUrl} alt={item.title} className="w-full h-40 md:h-52 object-fill transition-transform duration-300" />
                  {item.title && (
                    <>
                      <div className="absolute bottom-0 left-0 right-0 bg-background/80 px-2 py-1.5" />
                      <div className="absolute bottom-2 left-2 right-2">
                        <h3 className="text-foreground text-[11px] font-bold leading-tight">{item.title}</h3>
                        {item.description && <p className="text-muted-foreground text-[9px] mt-0.5">{item.description}</p>}
                      </div>
                    </>
                  )}
                </Link>
              ) : (
                <div className="relative block rounded overflow-hidden">
                  <img src={item.imageUrl} alt={item.title} className="w-full h-40 md:h-52 object-fill" />
                  {item.title && (
                    <>
                      <div className="absolute bottom-0 left-0 right-0 bg-background/80 px-2 py-1.5" />
                      <div className="absolute bottom-2 left-2 right-2">
                        <h3 className="text-foreground text-[11px] font-bold leading-tight">{item.title}</h3>
                        {item.description && <p className="text-muted-foreground text-[9px] mt-0.5">{item.description}</p>}
                      </div>
                    </>
                  )}
                </div>
              )}
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};

export default BannerSlider;
