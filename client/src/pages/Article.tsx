import { useCallback, useEffect, useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link, useNavigate, useParams } from "react-router-dom"
import { AppDispatch, RootState } from "../redux/store"
import { FaEdit } from "react-icons/fa"
import { MdDelete } from "react-icons/md"
import "github-markdown-css"
import { deleteArticle } from "../redux/articleSlice"
import { toast } from "react-toastify"
import { resetState } from "../redux/articleSlice"
import Loader from "../components/layouts/Loader"
import Share from "../components/articlePage/Share"
import Writer from "../components/articlePage/Writer"
import UnderlineHeader from "../components/layouts/UnderlineHeader"
import RelatedPost from "../components/articlePage/RelatedPost"
import CommentBox from "../components/articlePage/CommentBox"
import ErrMsg from "../components/layouts/ErrMsg"
import { BsFillBookmarkFill } from "react-icons/bs"
import axios from "../utils/axiosConfig"
import { bookmarkArticle } from "../redux/userSlice"
import { getErrMsg } from "../utils/utilFunctions"

export default function Article() {
  const { slug } = useParams()
  const {
    articles,
    articleSuccess,
    articleError,
    articleMessage,
    articleLoading,
    articleAction,
  } = useSelector((state: RootState) => state.article)
  const { user, users } = useSelector((state: RootState) => state.user)
  const article = articles.find((a) => a.slug === slug)
  const totalComments = useSelector(
    (state: RootState) => state.message.messages.length
  )
  const articleUser = users.find((u) => u._id === article?.writerId)
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const usersBookmarked = useMemo(
    () => new Set(user?.bookmarked),
    [user?.bookmarked]
  )

  useEffect(() => {
    if (articleAction === "DELETE") {
      if (articleSuccess) {
        toast(articleMessage, { type: "success", autoClose: 2300 })
        navigate("/")
        dispatch(resetState())
      }
      if (articleError) {
        dispatch(resetState())
        toast(articleMessage, { type: "error", autoClose: 2300 })
      }
    }
  }, [
    articleSuccess,
    articleError,
    articleMessage,
    articleAction,
    dispatch,
    navigate,
  ])

  const onArticleDelete = useCallback(() => {
    if (!article) return
    const makeSure = window.confirm("You really want to delete the article?")
    if (!makeSure) return
    dispatch(deleteArticle(article))
  }, [article, dispatch])

  const onArticleBookmark = useCallback(async () => {
    if (user === null || article === undefined) return
    try {
      const res = await axios(`/user/${user._id}/bookmark`, {
        method: "PUT",
        data: {
          articleId: article._id,
          isBookmark: usersBookmarked.has(article._id),
        },
      })
      dispatch(
        bookmarkArticle({
          articleId: res.data.articleId,
          isBookmark: res.data.isBookmark,
        })
      )
      toast(
        `${
          res.data.isBookmark
            ? "Removed article from your bookmark"
            : "Added article to your bookmark"
        }`,
        { type: "success", autoClose: 2300 }
      )
    } catch (err: any) {
      const message = getErrMsg(err)
      toast(message, { type: "error", autoClose: 2300 })
    }
  }, [user, article, dispatch, usersBookmarked])

  // 5eBnYp spelprogrammering.nu/koda

  return (
    <>
      {articleAction === "GET" && articleLoading ? (
        <Loader />
      ) : article ? (
        <main className="mt-24">
          <section className="wrapper max-w-[1240px] mx-auto">
            <figure className="shadow-xl rounded-[2rem] overflow-hidden mb-20 relative">
              <img
                src={article.thumbnailImg}
                alt="thumbnail"
                className="h-[60rem] w-full object-cover"
              />
              <div className="overlay absolute top-0 left-0 right-0 bottom-0 bg-[#0000004b]"></div>
              <div
                className={`${
                  user && article.writerId === user._id ? "block" : "hidden"
                } bg-violet-700 top-6 right-6 absolute flex gap-4 items-center py-2.5 px-4 rounded-full shadow-sm shadow-violet-500`}
              >
                <Link
                  to={`/edit/${slug}`}
                  className="text-3xl text-white text-medium cursor-pointer hover:text-green-300 transition-all"
                >
                  <FaEdit />
                </Link>

                <span
                  className="text-3xl text-white text-medium cursor-pointer hover:text-red-500 transition-all"
                  onClick={onArticleDelete}
                >
                  <MdDelete />
                </span>
              </div>
              <figcaption className="content absolute bottom-0 left-0 w-full mb-20">
                <div className="categories flex gap-4 items-center justify-center">
                  {article.categories.map((c, i) => (
                    <span
                      key={i}
                      className="text-white pb-1 border-0 border-b-2 border-solid border-white text-2xl tracking-wide"
                    >
                      {c}
                    </span>
                  ))}
                </div>
                <h1 className="text-5xl font-semibold text-white mt-12 mb-9 text-center">
                  {article.title}
                </h1>
                <div className="flex justify-center">
                  <figure className="flex items-center gap-3">
                    <img
                      src={
                        articleUser?.imgUrl
                          ? articleUser?.imgUrl
                          : "/images/guest.jpg"
                      }
                      alt="user"
                      className="w-16 h-16 object-cover rounded-full"
                    />
                    <div className="content flex items-center">
                      <span className="text-white text-xl">
                        {articleUser?.displayName}
                      </span>
                      <span className="text-white text-base mx-4">/</span>
                      <span className="text-white text-xl">
                        {new Date(article.createdAt).toLocaleDateString(
                          undefined,
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </span>
                      <span className="text-white text-base mx-4">/</span>
                      <span className="text-white text-xl">
                        {totalComments} Comments
                      </span>
                      <BsFillBookmarkFill
                        onClick={onArticleBookmark}
                        className={`text-3xl cursor-pointer ml-4 ${
                          user ? "block" : "hidden"
                        } ${
                          usersBookmarked.has(article._id)
                            ? "text-yellow-400"
                            : "text-white"
                        }`}
                      />
                    </div>
                  </figure>
                </div>
              </figcaption>
            </figure>
            <div
              className="markdown-body"
              dangerouslySetInnerHTML={{ __html: article.convertedHtml }}
            />

            {article.tags.length ? (
              <div className="mt-12 pb-16">
                <h1 className="text-gray-800 text-3xl font-semibold">Tags:</h1>
                <div className="tags flex gap-4 mt-6">
                  {article.tags.map((t, i) => (
                    <Link
                      key={i}
                      to="/"
                      className="border border-solid border-gray-400 rounded-xl text-xl text-gray-600 px-4 py-2 transition-all duration-300 hover:border-gray-800 hover:text-gray-800"
                    >
                      {t}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}

            <Share article={article} />
            <Writer articleUser={articleUser} user={user} article={article} />

            <div className="border-0 border-y border-solid border-gray-300 py-20">
              <h2 className="text-4xl mb-8 text-gray-800 capitalize font-semibold">
                other articles
              </h2>
              <div className="flex justify-between flex-wrap gap-6">
                <figure className="flex items-center gap-6">
                  <img
                    src="/images/user.jpg"
                    alt="user"
                    className="w-48 h-48 object-cover rounded-xl"
                  />
                  <figcaption>
                    <p className="text-2xl text-gray-500 mb-3">Recommended</p>
                    <Link
                      to="/"
                      className="bg-size hover:text-violet-700 transition-all duration-300 inline bg-gradient-to-r from-violet-700 to-violet-700 bg-no-repeat bg-left-bottom text-3xl text-gray-800 font-semibold"
                    >
                      How Good Deeds Can Benefit Your Local Business
                    </Link>
                  </figcaption>
                </figure>

                <figure className="flex items-center gap-6">
                  <img
                    src="/images/user.jpg"
                    alt="user"
                    className="w-48 h-48 object-cover rounded-xl"
                  />
                  <figcaption>
                    <p className="text-2xl text-gray-500 mb-3">Recommended</p>
                    <Link
                      to="/"
                      className="bg-size hover:text-violet-700 transition-all duration-300 inline bg-gradient-to-r from-violet-700 to-violet-700 bg-no-repeat bg-left-bottom text-3xl text-gray-800 font-semibold"
                    >
                      How Good Deeds Can Benefit Your Local Business
                    </Link>
                  </figcaption>
                </figure>
              </div>
            </div>

            <CommentBox article={article} />

            <div>
              <UnderlineHeader title="related posts" />
              <div className="grid grid-cols-4 gap-4 mt-8">
                <RelatedPost />
                <RelatedPost />
                <RelatedPost />
                <RelatedPost />
              </div>
            </div>
          </section>
        </main>
      ) : (
        <ErrMsg msg="article doesn't exists" />
      )}
    </>
  )
}
