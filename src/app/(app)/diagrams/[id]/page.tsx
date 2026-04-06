import DiagramEditor from './DiagramEditor'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function DiagramEditorPage({ params }: PageProps) {
  const { id } = await params
  return <DiagramEditor id={id} />
}
