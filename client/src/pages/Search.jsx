import { Button, Select, TextInput } from "flowbite-react";
import { useEffect, useState } from "react";
import { data, Link, useLocation, useNavigate } from "react-router-dom";
import PostCard from "../components/PostCard";
import { useSelector } from "react-redux";

export default function Search() {
    const [sidebarData, setSidebarData] = useState({
        searchTerm: '',
        sort: 'desc',
        category: '',
        isExclusive: '',
    });
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(false)
    const [showMore, setShowMore] = useState(false)
    const location = useLocation()
    const navigate = useNavigate()
    const { currentUser } = useSelector(state => state.user)

    useEffect(() => {
        const urlParams = new URLSearchParams(location.search)
        const searchTermFromUrl = urlParams.get('searchTerm')
        const sortFromUrl = urlParams.get('sort')
        const categoryFromUrl = urlParams.get('category')
        const isExclusiveFromUrl = urlParams.get('isExclusive');

        if(searchTermFromUrl || sortFromUrl || categoryFromUrl){
            setSidebarData({
                ...sidebarData,
                searchTerm: searchTermFromUrl,
                sort: sortFromUrl || 'desc',
                category: categoryFromUrl || '',
                isExclusive: isExclusiveFromUrl || '',
            })
        }

        const fetchPosts = async () => {
            setLoading(true)
            const searchQuery = urlParams.toString()
            const res = await fetch(`/api/post/getposts?${searchQuery}`)
            if(!res.ok){
                setLoading(false)
                return
            }
            if(res.ok){
                const data = await res.json()
                setPosts(data.posts)
                setLoading(false)
                if(data.posts.length === 9){
                    setShowMore(true)
                } else {
                    setShowMore(false)
                }
            }
        }
        fetchPosts()

    }, [location.search])

    const handleChange = (e) => {
        if (e.target.id === 'searchTerm'){
            setSidebarData({ ...sidebarData, searchTerm: e.target.value })
        }
        if(e.target.id === 'sort'){
            const order = e.target.value || 'desc'
            setSidebarData({...sidebarData, sort: order})
        }
        if(e.target.id === 'category'){
            const category = e.target.value || ''
            setSidebarData({ ...sidebarData, category })
        }
        if (e.target.id === 'isExclusive') {
        const value = e.target.value;
        setSidebarData({ ...sidebarData, isExclusive: value });
        }
    }

    const handleSubmit = async(e) => {
        e.preventDefault()
        const urlParams = new URLSearchParams(location.search)
        urlParams.set('searchTerm', sidebarData.searchTerm)
        urlParams.set('sort', sidebarData.sort)
        urlParams.set('category', sidebarData.category)
        urlParams.set('isExclusive', sidebarData.isExclusive);
        const searchQuery = urlParams.toString()
        navigate(`/search?${searchQuery}`)
    }

    const handleShowMore = async() => {
        const numberOfPosts = posts.length;
        const startIndex = numberOfPosts
        const urlParams = new URLSearchParams(location.search)
        urlParams.set('startIndex', startIndex)
        const searchQuery = urlParams.toString()
        const res = await fetch(`/api/post/getposts?${searchQuery}`)
        if(!res.ok){
            return
        }
        if(res.ok){
            const data = await res.json()
            setPosts([...posts, ...data.posts])
            if(data.posts.length === 9){
                setShowMore(true)
            } else {
                setShowMore(false)
            }
        }
    }


  return (
    <div className="flex flex-col md:flex-row">
        <div className="p-7 border-b md:border-r md:min-h-screen border-gray-500">
            <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
                <div className="flex items-center gap-2">
                    <label className="whitespace-nowrap font-semibold">Busqueda:</label>
                    <TextInput placeholder="buscar..." id="searchTerm" type="text" value={sidebarData.searchTerm} onChange={handleChange} />
                </div>

                <div className="flex items-center gap-2">
                    <label className="font-semibold">Orden:</label>
                    <Select onChange={handleChange} value={sidebarData.sort} id="sort">
                        <option value='desc'>Reciente</option>
                        <option value='asc'>Antiguo</option>
                    </Select>
                </div>

                <div className="flex items-center gap-2">
                    <label className="font-semibold">Categoria:</label>
                    <Select onChange={handleChange} value={sidebarData.category} id="category">
                        <option value=''>Sin categoria</option>
                        <option value='CivilizacionesAntiguas'>Civilizaciones Antiguas</option>
                        <option value='GuerrasyRevoluciones'>Guerras y Revoluciones</option>
                        <option value='PersonajesHistoricos'>Personajes Históricos</option>
                        <option value='HistoriadeMexico'>Historia de México</option>
                    </Select>
                </div>

                <div className="flex items-center gap-2">
                    <label className="font-semibold">Exclusivo:</label>
                    <Select onChange={handleChange} value={sidebarData.isExclusive} id="isExclusive">
                        <option value=''>Todos</option>
                        <option value='true'>Solo exclusivos</option>
                        <option value='false'>No exclusivos</option>
                    </Select>
                </div>

                <Button type="submit">
                    Buscar
                </Button>
            </form>
        </div>

        <div className="w-full">
  <h1 className="text-3xl font-semibold sm:border-b border-gray-500 p-3 mt-5">Resultados</h1>

  <div className="p-7 flex flex-wrap gap-4 justify-center">
    {!loading && posts.length === 0 && (
      <p className="text-xl text-gray-500">No hay artículos</p>
    )}

    {loading && <p className="text-xl text-gray-500">Cargando...</p>}

    {!loading &&
      posts.map((post) => (
        <div key={post._id} className="relative">
          <PostCard post={post} />
          {post.isExclusive && (!currentUser || !currentUser.isSubscribed) && (
            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center rounded-lg">
              <p className="text-white font-semibold text-center px-2">
                🔒 Contenido exclusivo<br />
                <Link to="/suscribete" className="underline text-yellow-300">
                  Suscríbete para acceder
                </Link>
              </p>
            </div>
          )}
        </div>
      ))}

    {showMore && (
      <button
        onClick={handleShowMore}
        className="text-teal-500 text-lg hover:underline p-7 w-full"
      >
        Ver más
      </button>
    )}
  </div>
</div>

    </div>
  )
}
