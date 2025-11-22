import { Link } from 'react-router-dom'
import CallToAction from '../components/CallToAction'
import { useEffect, useState } from 'react'
import PostCard from '../components/PostCard'
import { useSelector } from 'react-redux';

export default function Home() {

  const [posts, setPosts] = useState([])
  const [recentPosts, setRecentPosts] = useState([]);
  const [exclusivePosts, setExclusivePosts] = useState([]);

  const { currentUser } = useSelector(state => state.user);


  useEffect(() => {
  const fetchPosts = async () => {
    try {
      const [recentRes, exclusiveRes] = await Promise.all([
        fetch('/api/post/getposts?isExclusive=false'),
        fetch('/api/post/getposts?isExclusive=true'),
      ]);

      const recentData = await recentRes.json();
      const exclusiveData = await exclusiveRes.json();

      console.log("recent", recentData)
      console.log("exlcusive", exclusiveData)

      setRecentPosts(recentData.posts || []);
      setExclusivePosts(exclusiveData.posts || []);
    } catch (error) {
      console.log('Error al obtener posts:', error);
    }
  };

  fetchPosts();
}, []);


  return (
    <div>
      <div className='flex flex-col gap-6 p-28 px-3 max-w-6xl mx-auto'>
        <h1 className="text-3xl font-bold lg:text-6xl">Bienvenidos</h1>
        <p className='text-gray-500 text-xs sm:text-sm'>Explora con nosotros los relatos fascinantes que han forjado nuestra historia y cultura. Desde las antiguas civilizaciones hasta los eventos que moldearon el mundo moderno, aquí encontrarás artículos confiables y accesibles que te invitan a aprender, reflexionar y conectar con nuestro pasado.</p>
        <Link to='/search' className='text-xs sm:text-sm text-teal-500 font-bold hover:underline'>Ver todos los articulos</Link>
      </div>

      <div className="max-w-6xl mx-auto p-3 flex flex-col gap-8 py-7">
        {recentPosts.length > 0 && (
        <div className="flex flex-col gap-6">
          <h2 className='text-3xl font-semibold text-center'>Artículos recientes</h2>
          <div className="flex flex-wrap gap-4 justify-center">
            {recentPosts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
          <Link to={'/search?isExclusive=false'} className='text-lg text-teal-500 hover:underline text-center mt-6'>Ver todos los artículos</Link>
        </div>
      )}

      {exclusivePosts.length > 0 && (
        <div className="flex flex-col gap-6 mt-12">
          <h2 className='text-3xl font-semibold text-center text-yellow-500'>Artículos exclusivos 🔒</h2>
          <div className="flex flex-wrap gap-4 justify-center">
            {exclusivePosts.map((post) => (
              <div key={post._id} className="relative">
                <PostCard post={post} />
                {(!currentUser || !currentUser.isSubscribed) && (
                  <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center rounded-lg">
                    <p className="text-white font-semibold text-center px-2">Contenido exclusivo<br />
                      <Link to="/suscribete" className="underline text-yellow-300">Suscríbete para acceder</Link>
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
          <Link to={'/search?isExclusive=true'} className='text-lg text-teal-500 hover:underline text-center mt-6'>Ver todos los artículos</Link>
        </div>
      )}
      </div>
    </div>
  )
}
