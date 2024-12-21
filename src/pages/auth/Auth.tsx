import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import supabase from '../../core/supbase/config'
import { useUser } from '@/hooks/UserContext'
import { UserService } from '@/utils/api_requests/UserApi'
const AuthPage: React.FC = () => {
    const navigate = useNavigate()
    const userContext = useUser()


    const fetchMe = async () => {
      try{
        const data = await UserService.me()
        userContext.setUser(data)
      }catch(err:any){
        console.error('Error fetching user data:', err)
      }
    }
    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'SIGNED_IN') {

            }
        })

        return () => {
            authListener.subscription.unsubscribe()
        }
    }, [])

    return (
        <div className="flex  items-center justify-center font-inter min-h-screen">
            {loading ? (
                <CircularProgress sx={{ color: FlexColors.primary }} />
            ) : (
                <Container maxWidth="sm">
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            marginTop: '50px',
                        }}
                    >
                        <Logo />
                    </div>

                    <div className="bg-zinc-50 rounded-xl shadow-sm border border-zinc-300 px-11 py-12">
                        <Auth
                            supabaseClient={supabase}
                            socialLayout="vertical"
                            appearance={{
                                theme: customTheme,
                                style: {
                                    button: {
                                        borderColor: 'hsla(0, 0%, 87%, 1)',
                                        borderWidth: '1px',
                                    },
                                    input: {
                                        borderColor: 'hsla(0, 0%, 87%, 1)',
                                        borderWidth: '1px',
                                    },
                                    anchor: {
                                        fontSize: '14px',
                                        alignContent: 'left',
                                    },
                                    divider: {
                                        backgroundColor: 'hsla(0, 0%, 87%, 1)',
                                    },
                                },
                            }}
                            localization={{
                                variables: {
                                    sign_in: {
                                        email_label: 'Email',
                                        email_input_placeholder: 'abc@xyz.com',
                                        password_label: 'Password',
                                        password_input_placeholder: 'Enter your password',
                                        button_label: 'Login',
                                        loading_button_label: 'Loading...',
                                    },

                                    sign_up: {
                                        email_label: 'Email',
                                        email_input_placeholder: 'abc@xyz.com',
                                        password_label: 'Password',
                                        password_input_placeholder: 'Enter your password',
                                        social_provider_text: 'Sign in with {{provider}}',
                                    },
                                },
                            }}
                            redirectTo={window.location.origin}
                            providers={['google']}
                        />
                    </div>
                </Container>
            )}
        </div>
    )
}

export default AuthPage
