"use client";

interface Props {
  productName: string;
  ingredients: string;
  onProductNameChange: (v: string) => void;
  onIngredientsChange: (v: string) => void;
}

export default function ManualInput({
  productName,
  ingredients,
  onProductNameChange,
  onIngredientsChange,
}: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <label
          style={{
            display: "block",
            fontWeight: 600,
            marginBottom: 6,
            fontSize: 15,
          }}
        >
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
          style={{
            display: "block",
            fontWeight: 600,
            marginBottom: 6,
            fontSize: 15,
          }}
        >
          配料表
        </label>
        <textarea
          value={ingredients}
          onChange={(e) => onIngredientsChange(e.target.value)}
          placeholder="请按包装上的顺序输入配料表，用中文逗号或顿号分隔&#10;例如：水、椰子水、白砂糖、食用香精"
        />
        <p className="text-hint" style={{ marginTop: 6 }}>
          提示：配料表中排名越靠前的成分，含量越高
        </p>
      </div>
    </div>
  );
}
