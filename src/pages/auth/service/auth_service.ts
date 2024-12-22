import { UserService, User } from "@/utils/api_requests/UserApi"

export const fetchMe = async (): Promise<User | undefined> => {

    try {
        const data = await UserService.me()
        return data
    } catch (err: any) {
        console.log(err)
    }
}