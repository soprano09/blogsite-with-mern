import { useGet } from "../../hooks/useGet"
import { MongoArticle } from "../../utils/types"
import Pagination from "../homePage/Pagination"
import ErrMsg from "../layouts/ErrMsg"
import Loader from "../layouts/Loader"
import OverlapHeader from "../layouts/OverlapHeader"
import RecentPost from "../layouts/PostCard"
import { useState } from "react"
import usePagination from "../../hooks/usePagination"

interface Props {
  userId: string
}

export default function RecentPosts({ userId }: Props) {
  const [page, setPage] = useState<number>(0)

  const { data: articles, loading } = useGet<[] | MongoArticle[]>(
    `/article/${userId}/user`,
    []
  )

  const paginationArticles = usePagination(articles, 6)

  return (
    <>
      {loading ? (
        <Loader />
      ) : paginationArticles.length ? (
        <section className="mt-44" id="posts">
          <OverlapHeader
            title="Recent posts"
            overlapTitle="before:content-['creative']"
          />

          <div className="posts grid grid-cols-3 gap-8 mt-28">
            {paginationArticles[page].map((a) => (
              <RecentPost
                key={a._id}
                articleImg={a.thumbnailImg}
                articleTitle={a.title}
                articleSlug={a.slug}
              />
            ))}
          </div>
          {paginationArticles.length > 1 && (
            <Pagination
              page={page}
              setPage={setPage}
              pages={paginationArticles.length}
            />
          )}
        </section>
      ) : (
        <ErrMsg msg="You didn't wrote any articles yet" />
      )}
    </>
  )
}
