import type { NextPage } from 'next'
import { useRouter } from 'next/dist/client/router'

const Home: NextPage = () => {
    const router = useRouter();
    const { id } = router.query;
    return (
        <h1>{id}</h1>
    )
}

export default Home
