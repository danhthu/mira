"""Sinh bộ icon cho PWA.

Vẽ bằng mã chứ không nhập ảnh: icon phải sinh lại được từ repo. Ai đó đổi màu thương
hiệu thì sửa một hằng số ở đây rồi chạy lại, không phải đi tìm file .psd.

Chữ M vẽ bằng đa giác, KHÔNG dùng font. Font có mặt trên máy này chưa chắc có trên máy
khác, mà icon sinh ra khác nhau giữa hai máy là thứ không ai nhận ra cho tới lúc nó
đã nằm trên màn hình điện thoại.

Nền tràn viền và chữ chỉ chiếm phần giữa, nên cùng một file dùng được cho cả icon
thường lẫn icon `maskable` — iOS và Android đều bo góc theo cách riêng của chúng.

Chạy:  python code/web/make-icons.py
"""

from PIL import Image, ImageDraw

# Màu thương hiệu, khớp --brand trong src/styles/tokens.css.
NEN = (79, 70, 229)
CHU = (255, 255, 255)

# Độ phân giải vẽ: vẽ lớn rồi thu nhỏ cho cạnh chữ mượt.
VE = 2048


def ve_icon() -> Image.Image:
    img = Image.new("RGB", (VE, VE), NEN)
    d = ImageDraw.Draw(img)

    # Chữ M: bốn nét, vẽ bằng một đa giác liền.
    #
    # Toạ độ theo tỷ lệ cạnh, chữ chiếm khoảng 46% bề ngang và nằm giữa — đủ xa mép để
    # Android bo tròn kiểu gì cũng không cắt vào nét.
    s = VE
    x0, x1 = 0.30 * s, 0.70 * s          # mép trái / phải của chữ
    y0, y1 = 0.32 * s, 0.68 * s          # đỉnh / đáy
    net = 0.082 * s                       # bề dày nét
    giua_x = (x0 + x1) / 2
    giua_y = y0 + (y1 - y0) * 0.52       # đáy của chữ V ở giữa

    d.polygon(
        [
            (x0, y1),
            (x0, y0),
            (x0 + net, y0),
            (giua_x, giua_y - net * 0.35),
            (x1 - net, y0),
            (x1, y0),
            (x1, y1),
            (x1 - net, y1),
            (x1 - net, y0 + net * 1.5),
            (giua_x, giua_y + net * 0.9),
            (x0 + net, y0 + net * 1.5),
            (x0 + net, y1),
        ],
        fill=CHU,
    )
    return img


def main() -> None:
    goc = ve_icon()
    # 180 cho apple-touch-icon (iOS), 192 và 512 cho manifest, 32 cho tab trình duyệt.
    for canh in (32, 180, 192, 512):
        goc.resize((canh, canh), Image.LANCZOS).save(
            f"public/icon-{canh}.png", "PNG", optimize=True
        )
        print(f"public/icon-{canh}.png")


if __name__ == "__main__":
    main()
