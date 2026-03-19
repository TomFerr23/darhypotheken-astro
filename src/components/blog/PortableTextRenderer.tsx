import { PortableText } from "@portabletext/react";
import { urlFor } from "@/sanity/image";

const components = {
  types: {
    image: ({ value }: { value: { asset: { _ref: string }; alt?: string } }) => (
      <div className="my-8 overflow-hidden rounded-xl">
        <img
          src={urlFor(value).width(800).url()}
          alt={value.alt || ""}
          width={800}
          height={450}
          className="h-auto w-full"
          loading="lazy"
        />
      </div>
    ),
  },
  block: {
    h2: ({ children }: { children?: React.ReactNode }) => (
      <h2 className="mt-10 mb-4 text-2xl font-semibold text-dar-slate">
        {children}
      </h2>
    ),
    h3: ({ children }: { children?: React.ReactNode }) => (
      <h3 className="mt-8 mb-3 text-xl font-semibold text-dar-slate">
        {children}
      </h3>
    ),
    normal: ({ children }: { children?: React.ReactNode }) => (
      <p className="mb-4 leading-relaxed text-dar-gray">{children}</p>
    ),
    blockquote: ({ children }: { children?: React.ReactNode }) => (
      <blockquote className="my-6 border-l-4 border-dar-blue pl-4 italic text-dar-gray/80">
        {children}
      </blockquote>
    ),
  },
  marks: {
    link: ({
      children,
      value,
    }: {
      children: React.ReactNode;
      value?: { href: string };
    }) => (
      <a
        href={value?.href}
        className="text-dar-blue underline hover:opacity-80"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
  },
  list: {
    bullet: ({ children }: { children?: React.ReactNode }) => (
      <ul className="mb-4 list-disc space-y-1 pl-6 text-dar-gray">
        {children}
      </ul>
    ),
    number: ({ children }: { children?: React.ReactNode }) => (
      <ol className="mb-4 list-decimal space-y-1 pl-6 text-dar-gray">
        {children}
      </ol>
    ),
  },
};

export default function PortableTextRenderer({ value }: { value: unknown[] }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <PortableText value={value as any} components={components as any} />;
}
