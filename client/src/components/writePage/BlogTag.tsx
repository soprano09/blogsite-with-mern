import { MdOutlineClose } from "react-icons/md"

interface Props {
  name: string
}

export default function BlogTag({ name }: Props) {
  return (
    <h1 className="bg-white rounded-lg text-2xl text-gray-800 font-medium tracking-wide px-5 py-3 flex items-center gap-2.5">
      {name}
      <MdOutlineClose className="text-3xl p-1.5 rounded-full bg-gray-200/70 cursor-pointer" />
    </h1>
  )
}
