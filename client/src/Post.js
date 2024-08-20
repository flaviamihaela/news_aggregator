export default function Post({_id, articleName, articleLink, category, date, imagesource, source}) {
    return (
        <div className="post">
        <div className="image">
          <img src={imagesource}></img>
        </div>
        <div className="texts">
          <h2>
            <a href={articleLink} className="article-link">{articleName}</a>
          </h2>
          <p className="info">
            <a className="author">{source}</a>
            <time>{date}</time>
            <a className="category">{category}</a>
          </p>
        </div>
      </div>
    );
}