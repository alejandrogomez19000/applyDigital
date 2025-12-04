import { IArticle } from "@/interfaces/global";
import { indexArticlesById } from "../helpers";

describe("indexArticlesById", () => {
  test("returns an empty object when given an empty array", () => {
    expect(indexArticlesById([])).toEqual({});
  });

  test("indexes articles by objectID", () => {
    const articles: IArticle[] = [
      {
        objectID: "1",
        title: "Android News",
        story_title: "",
        story_url: "https://example.com/android",
        author: "alice",
        created_at: "2025-01-01T10:00:00Z",
        comment_text: "",
        created_at_i: 0,
        parent_id: 0,
        story_id: 0,
        updated_at: "",
      },
      {
        objectID: "2",
        title: "iOS Update",
        story_title: "",
        story_url: "https://example.com/ios",
        author: "bob",
        created_at: "2025-01-01T11:00:00Z",
        comment_text: "",
        created_at_i: 0,
        parent_id: 0,
        story_id: 0,
        updated_at: "",
      },
    ];

    const result = indexArticlesById(articles);

    expect(result).toEqual({
      "1": articles[0],
      "2": articles[1],
    });
  });

  test("preserves the full article object", () => {
    const article: IArticle = {
      objectID: "abc123",
      title: "React Native 2025",
      story_title: "",
      story_url: "https://example.com/rn",
      author: "carol",
      created_at: "2025-01-01T12:00:00Z",
      comment_text: "",
      created_at_i: 0,
      parent_id: 0,
      story_id: 0,
      updated_at: "",
    };

    const result = indexArticlesById([article]);

    expect(result["abc123"]).toBe(article); // same reference
  });

  test("last duplicate objectID wins", () => {
    const articles: IArticle[] = [
      {
        objectID: "1",
        title: "First",
        story_title: "",
        story_url: "",
        author: "x",
        created_at: "2025-01-01",
        comment_text: "",
        created_at_i: 0,
        parent_id: 0,
        story_id: 0,
        updated_at: "",
      },
      {
        objectID: "1",
        title: "Second",
        story_title: "",
        story_url: "",
        author: "y",
        created_at: "2025-01-02",
        comment_text: "",
        created_at_i: 0,
        parent_id: 0,
        story_id: 0,
        updated_at: "",
      },
    ];

    const result = indexArticlesById(articles);

    expect(result["1"]).toEqual(articles[1]);
    expect(result["1"].title).toBe("Second");
  });
});
