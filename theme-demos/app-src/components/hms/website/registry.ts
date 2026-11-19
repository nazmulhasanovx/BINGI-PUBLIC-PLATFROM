import type { ComponentType } from "react";
import { DesignSimple, OverviewSimple } from "./simple";
import { PagesPage, SectionsPage } from "./design";
import { InfoPage, OffersPage, PhotosPage, ReviewsPage, RoomsPage, ServicesPage } from "./content";
import { BookingPage, DomainPage, InquiriesPage, LanguagesPage, OnlinePage, PublishPage, SeoPage } from "./settings";

export const PAGE_COMPONENTS: Record<string, ComponentType> = {
  overview: OverviewSimple,
  design: DesignSimple,
  homepage: SectionsPage,
  pages: PagesPage,
  photos: PhotosPage,
  rooms: RoomsPage,
  services: ServicesPage,
  offers: OffersPage,
  reviews: ReviewsPage,
  info: InfoPage,
  booking: BookingPage,
  inquiries: InquiriesPage,
  seo: SeoPage,
  domain: DomainPage,
  languages: LanguagesPage,
  online: OnlinePage,
  publish: PublishPage,
};
