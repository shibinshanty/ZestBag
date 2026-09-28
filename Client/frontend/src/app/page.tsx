import Hero from "../components/home/Hero";
import Categories from "../components/home/Categories";
import FeaturedProducts from "../components/home/FeaturedProducts"; 
 
export default function Home() {
  return (
    <main>
      <Hero />
      <Categories />
     <FeaturedProducts/>
    </main>
  );
}