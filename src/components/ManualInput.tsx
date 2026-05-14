"use client";

interface Props {
  productName: string;
  ingredients: string;
  claims: string;
  onProductNameChange: (v: string) => void;
  onIngredientsChange: (v: string) => void;
  onClaimsChange: (v: string) => void;
}

export default function ManualInput({
  productName,
  ingredients,
  claims,
  onProductNameChange,
  onIngredientsChange,
  onClaimsChange,
}: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <label
          style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: 15 }}>
          商品名称
        </label>
        <input
          type="text"
          value={productName}
          onChange={(e) => onProductNameChange(e.target.value)}
          placeholder="例如：100%纯椰子水"
        />
      </div>
      <div>
        <label
          style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: 15 }}>
          包装宣传语
        </label>
        <textarea
          value={claims}
          onChange={(e) => onClaimsChange(e.target.value)}
          placeholder="包装正面写了哪些宣传语？&#10;例如：无添加、0糖、高蛋白、纯天然…"
          style={{ minHeight: 60 }}
        />
        <p className="text-hint" style={{ marginTop: 6 }}>
          这是分析的对比依据，写得越完整分析越准确
        </p>
      </div>
      <div>
        <label
          style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: 15 }}>
          配料表
        </label>
        <textarea
          value={ingredients}
          onChange={(e) => onIngredientsChange(e.target.value)}
          placeholder="请按包装上的顺序输入配料表&#10;例如：水、椰子水、白砂糖、食用香精"
        />
        <p className="text-hint" style={{ marginTop: 6 }}>
          配料表中排名越靠前的成分，含量越高
        </p>
      </div>
    </div>
  );
}
