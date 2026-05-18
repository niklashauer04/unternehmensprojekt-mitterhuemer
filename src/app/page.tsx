import { ConfiguratorWizard } from "@/features/configurator/components/wizard";
import { STANDBEINE, type StandbeinId } from "@/features/configurator/model";

type HomeProps = {
  searchParams?: Promise<{
    projekt?: string;
  }>;
};

function isStandbeinId(value: string | undefined): value is StandbeinId {
  return STANDBEINE.some((standbein) => standbein.id === value);
}

export default async function Home({ searchParams }: HomeProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const projekt = resolvedSearchParams?.projekt;
  const initialProjectStandbein = isStandbeinId(projekt) ? projekt : null;

  return (
    <ConfiguratorWizard
      key={initialProjectStandbein ?? "default"}
      initialProjectStandbein={initialProjectStandbein}
    />
  );
}
