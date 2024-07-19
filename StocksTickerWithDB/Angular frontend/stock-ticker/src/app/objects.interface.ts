export interface NewsData {
    category: string;
    datetime: number;
    headline: string;
    id: number;
    image: string;
    related: string;
    source: string;
    summary: string;
    url: string;
}

export interface autocompleteOptions {
    description: string;
    displaySymbol: string;
    symbol: string;
    type: string;
}