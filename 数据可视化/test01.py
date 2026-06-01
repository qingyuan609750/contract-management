import matplotlib.pyplot as plt
import numpy as np

# 生成数据
x = np.linspace(0.05, 10, 100)
y1 = np.sin(x)
y2 = np.cos(x)

# 绘图并添加标签，方便图例识别
plt.plot(x, y1, label='sin(x)', color='blue')
plt.plot(x, y2, label='cos(x)', color='red')

# 添加标题、坐标轴标签和图例
plt.title('Sin and Cos Curves')
plt.xlabel('x')
plt.ylabel('y')
plt.legend() # 显示图例

# 显示网格线，更方便观察数值
plt.grid(True, linestyle='--', alpha=0.6)

plt.show()