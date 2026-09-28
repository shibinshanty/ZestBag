

export type CartItem = {
    productId:string,
    title:string,
    price: number,
    image:string,
    quantity:number,
    selected:boolean
}

export type Cart = {
    user:string,
    items:CartItem[]
}
