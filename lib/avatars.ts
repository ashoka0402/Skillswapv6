// Static avatar system to replace Cloudinary
export const AVATAR_OPTIONS = [
  {
    id: "avatar-1",
    name: "Friendly Face",
    url: "https://imgs.search.brave.com/Cm5m9LlAlR6PudX72Iyojcph9dfrrjU9pBXwmFQ9A_Y/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9waG90/b2F2YXRhcm1ha2Vy/LmNvbS93cC1jb250/ZW50L3VwbG9hZHMv/MjAyNS8wNS9hbmlt/ZS1zdWt1bmEtYXZh/dGFyLXNhbXBsZS5q/cGVn",
    color: "from-blue-500 to-purple-500",
  },
  {
    id: "avatar-2",
    name: "Professional",
    url: "https://imgs.search.brave.com/jKWrppIIp56bSyZsClGMqzcVlTEwrZ1XqyYnT1uAaW4/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWd2/My5mb3Rvci5jb20v/aW1hZ2VzL2dhbGxl/cnkvYW5pbWUtbWFs/ZS1hdmF0YXItd2l0/aC1hLXBhaXItb2Yt/Z2xhc3Nlcy1tYWRl/LWluLWZvdG9yLWFp/LWFuaW1lLWF2YXRh/ci1jcmVhdG9yLmpw/Zw",
    color: "from-green-500 to-blue-500",
  },
  {
    id: "avatar-3",
    name: "Creative",
    url: "https://imgs.search.brave.com/UU2T0XHhaEu6ubdhTm2UzXWF2lqF_xk6QLAY1myCkWA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pLnBp/bmltZy5jb20vb3Jp/Z2luYWxzLzQxLzFl/L2E4LzQxMWVhODc2/NDY2ZjE1MDNhNjE0/N2EyOWMyMGRhOTdl/LmpwZw",
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "avatar-4",
    name: "Tech Enthusiast",
    url: "https://imgs.search.brave.com/OStYj5GQj9N2TytJRD4Sw3oZrySFa1ChwyJKqa41j0E/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pLnBp/bmltZy5jb20vb3Jp/Z2luYWxzL2JmLzMw/L2Y3L2JmMzBmN2Y2/ZWM0N2U2MzUyZTMz/MzUyMDY0M2JhODAx/LmpwZw",
    color: "from-yellow-500 to-red-500",
  },
  {
    id: "avatar-5",
    name: "Nature Lover",
    url: "https://imgs.search.brave.com/nwy_bYuNmmb38JnkdNDy_V1gS15FlRu9QzLODv2LKQA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90aHlw/aXguY29tL3dwLWNv/bnRlbnQvdXBsb2Fk/cy8yMDIyLzA4L2Fu/eWEtZm9yZ2VyLXNw/eS14LWZhbWlseS10/aHlwaXgtMTIwLTQw/OHg0MDguanBn",
    color: "from-green-400 to-emerald-500",
  },
]

export const getRandomAvatars = (count = 5): typeof AVATAR_OPTIONS => {
  const shuffled = [...AVATAR_OPTIONS].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

export const getAvatarById = (id: string) => {
  return AVATAR_OPTIONS.find((avatar) => avatar.id === id) || AVATAR_OPTIONS[0]
}

export const getDefaultAvatar = (userName: string) => {
  // Generate consistent avatar based on username
  const index = userName.charCodeAt(0) % AVATAR_OPTIONS.length
  return AVATAR_OPTIONS[index]
}
