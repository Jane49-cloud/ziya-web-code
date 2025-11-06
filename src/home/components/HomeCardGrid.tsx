import type { HomeCardConfig } from "../constants";
import HomeCard from "./HomeCard";

interface HomeCardGridProps {
  cards: HomeCardConfig[];
}

const HomeCardGrid: React.FC<HomeCardGridProps> = ({ cards }) => {
  const primaryCards = cards.filter((card) => card.layout !== "banner");
  const bannerCard = cards.find((card) => card.layout === "banner");

  return (
    <section id="home-programs" className="mt-12">
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {primaryCards.map((card) => (
          <HomeCard key={card.id} {...card} />
        ))}

        {bannerCard && (
          <div className="sm:col-span-2 xl:col-span-3">
            <HomeCard {...bannerCard} />
          </div>
        )}
      </div>
    </section>
  );
};

export default HomeCardGrid;
