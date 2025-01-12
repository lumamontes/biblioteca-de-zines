const PREVIEW_GRAPHQL_FIELDS = `
  sys {
    id
  }
  previewpdf {
    sys {
      id
    }
    url
    description
  }
`;

type fethGraphQLProps = {
  query: string;
  preview: boolean;
};

async function fetchGraphQL({ query }: fethGraphQLProps) {
  const preview = process.env.NODE_ENV === "development";
  return fetch(
    `https://graphql.contentful.com/content/v1/spaces/${process.env.CONTENTFUL_SPACE_ID}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${
          preview
            ? process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN
            : process.env.CONTENTFUL_ACCESS_TOKEN
        }`,
      },
      body: JSON.stringify({ query }),
    }
  ).then((response) => response.json());
}

type fetchResponseProps = {
  data: {
    pdfurlpreviewCollection: {
      items: {
        sys: {
          id: string;
        };
        previewpdf: {
          sys: {
            id: string;
          };
          url: string;
          description: string;
        };
      }[];
    };
  };
};

function extractPreviewEntry(fetchResponse: fetchResponseProps) {
  return fetchResponse?.data?.pdfurlpreviewCollection?.items[0];
}

export async function getPreview() {
  const isDraftMode = process.env.NODE_ENV === "development";
  const article = await fetchGraphQL({
    query: `query {
      pdfurlpreviewCollection(limit: 1, preview: ${isDraftMode}) {
        items {
          ${PREVIEW_GRAPHQL_FIELDS}
        }
      }
    }`,
    preview: isDraftMode,
  });
  return extractPreviewEntry(article);
}
