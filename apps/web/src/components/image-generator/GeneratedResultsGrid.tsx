import { Expand, Grid2X2, Heart, List, MoreHorizontal } from "lucide-react";
import type { GeneratedImage, ResultLayout } from "../../types/imageGenerator";

function Artwork({ image }: { image: GeneratedImage }) {
  if (image.imageUrl) {
    return <img className="block aspect-square w-full bg-[#06111b] object-cover" src={image.imageUrl} alt={image.title} />;
  }
  return (
    <div className="ig-artwork" style={{ "--art-a": image.palette[0], "--art-b": image.palette[1], "--art-c": image.palette[2] } as React.CSSProperties}>
      <div className="ig-art-orbit" />
      <span>BRICK-MAKER</span>
      <strong>{image.title}</strong>
      <small>Premium creative collection</small>
      <b>EXPLORE NOW</b>
    </div>
  );
}

export function GeneratedResultsGrid(props: {
  images: GeneratedImage[];
  selectedId: string;
  layout: ResultLayout;
  onLayout: (layout: ResultLayout) => void;
  onSelect: (id: string) => void;
  onFavorite: (id: string) => void;
  onPreview: (image: GeneratedImage) => void;
  onMenu: (image: GeneratedImage) => void;
}) {
  return (
    <section className="ig-results">
      <div className="ig-section-heading">
        <h2>AI GENERATED RESULTS</h2>
        <div><span>{props.images.length} Results</span><button className={props.layout === "grid" ? "is-active" : ""} onClick={() => props.onLayout("grid")} aria-label="Grid view"><Grid2X2 size={15} /></button><button className={props.layout === "list" ? "is-active" : ""} onClick={() => props.onLayout("list")} aria-label="List view"><List size={15} /></button></div>
      </div>
      <div className={`ig-result-grid ${props.layout === "list" ? "is-list" : ""}`}>
        {props.images.map((image) => (
          <article key={image.id} className={`ig-result-card ${props.selectedId === image.id ? "is-selected" : ""}`} onClick={() => props.onSelect(image.id)}>
            <Artwork image={image} />
            <button className="ig-card-menu" onClick={(event) => { event.stopPropagation(); props.onMenu(image); }} aria-label={`More options for ${image.title}`}><MoreHorizontal size={16} /></button>
            <div className="ig-card-meta">
              <div><strong>{image.title}</strong><span>{new Date(image.createdAt).toLocaleDateString()}</span><p>{image.prompt}</p></div>
              <button onClick={(event) => { event.stopPropagation(); props.onFavorite(image.id); }} aria-label="Favorite"><Heart size={15} fill={image.favorite ? "currentColor" : "none"} /></button>
              <button onClick={(event) => { event.stopPropagation(); props.onPreview(image); }} aria-label="Fullscreen preview"><Expand size={15} /></button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
