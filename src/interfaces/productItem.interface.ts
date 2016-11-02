/**
 * Created by maxim on 21.10.16.
 */


export interface ProductItemInterface {
    name: string,
    slug: string,
    thumbnail: string,
    categoryTitle: string,
    danger_level: number,
    rating: number,
    tested: boolean,
    properties: any[]
}
