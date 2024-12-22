import { UserService } from "@/utils/api_requests/UserApi"
import { useUser } from "@/hooks/UserContext"

const fetchMe = async () => {
    const userContext = useUser()
    try {
        const data = await UserService.me()
        userContext.setUser(data)
    } catch (err: any) {
        console.error('Error fetching user data:', err)
    }
}