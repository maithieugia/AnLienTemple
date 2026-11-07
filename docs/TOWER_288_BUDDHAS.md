## 03/11/2026 — Tượng giữa cửa, vàng đồng sáng, bỏ bệ và sửa sàn đen (ĐÃ LÊN SERVER)

Revision `2026-11-03-centred-brass-2`. Checkpoint: authoring/checkpoints/20261103-centred-brass.

288 tượng giữ cao 5 m và cùng danh hiệu. Tượng chuyển về chính giữa trục từng cửa (offset=0), đặt phía ngoài tường với khoảng lùi 0,6 m sau lưng. Khẩu độ cửa tầng 36 là nhỏ nhất: sau khi trừ nửa bề rộng tượng và padding collider 0,15 m, còn khoảng 1,06 m mỗi bên. Đã kiểm đường đi capsule bán kính 0,3 m qua cả hai bên ở mọi tầng. Bỏ hoàn toàn bệ đá ghép, tòa sen gốc đặt trực tiếp trên sàn; bảng tên nâng lên trước chân tòa sen. Màu PBR vàng đồng #dfa83f, metallic0.55/roughness0.38, giảm màu tối nung trong texture albedo gốc và tăng sáng nhẹ; lưới và normal detail gốc giữ nguyên. GLB nguyên bản không sửa.

Sửa hai lỗi sàn: tách mặt sân dưới khỏi sàn trệt (−0,04 m / 0 m) để tránh trùng mặt; quan trọng hơn, BAcc tính normal từ cạnh A→D nên các tam giác dạng quad có D=A (quạt tâm sàn và nắp đá) nhận normal0, gây đen. TowerBatch nay tính normal dự phòng từ A→C qua StupaSurfacePlan.ts. Chỉ áp dụng tháp, không sửa BAcc toàn dự án. UV sàn đổi sang tọa độ phẳng theo mét để gạch không kéo thành nan quạt. Bỏ bump gây nhiễu trên đá/mặt dưới mái của tháp, dùng ánh sáng hai mặt. Mỗi bậc thêm mặt đứng đậm và viền mép sáng, giữ số bậc/cao độ/va chạm cũ.

Đã kiểm: tsc/build đạt, 13/13 test tháp+tượng đạt; có test normal hướng lên của96tamgiáctâmsàn và va chạm đường đi hai bên tượng trên36tầng. Browser local đã thấy sàn nhận sáng, không còn mảng đen ở góc cầu thang đã kiểm; bậc1–11 nhìn tách rõ. Đã chạy QA leo đủ3.360bậc tới tầng36, chân455m sau thay đổi. Ảnh: docs/centred-brass-clear-steps.png và centred-brass-local.png. Chưa nghiệm thu mọi góc chuyển động trong game online đầy đủ, mọi GPU/mobile; không tuyên bố xóa mọi artefact toàn khuôn viên.

Server đã cập nhật qua overlay có đủ3GLB tượng. Backup: /root/anlien-backups/2026-11-03-centred-brass-2-20261103T054059Z. Health/release/main/sharedchunk/3GLB tượng và7GLB sân đạt SHA; giữ2tài khoản và công đức[35,2,30,445]. Main assets/main-CmVe4EWC.js, SHA6600a2afc96312d1b09ef241ed67dff0a189d80f5926f47a5b14a8e8109800a5. Log docs/centred-brass-deploy.log và centred-brass-production-verification.json. Baseline full river vẫn cũ: dùng pack-tower288.mjs cho overlay có đủ asset, hoặc đóng lại full release.


# 288 tượng trước cửa tháp — 03/11/2026

Dùng đúng GLB PBR do chủ dự án cung cấp, cùng một mẫu tượng được đặt8hướng×36tầng. Cao5m bao gồm tòa sen/hào quang có sẵn, bệ riêng0.4m; mặt hướng ra ngoài, lệch sang bên cửa. Giữ trống nguyên khẩu độ cửa và có collider tượng. Vòng cột ngoài dịch r−3→r−1.2m để mẫu5m có khoảng thoáng ở tầng trên; 8mặt sàn/mái,chiếu nghỉ/thang máy giữ nguyên. Kiểm số học tất cả tầng: toàn bounding footprint nằm trong lan can, không cắt cửa hoặc cột.

Mẫu gốc499.994tam giác, LOD80k/18k/2k; cùng3lưới bằng thin instances, phân LOD theo khoảng cách3D và ẩn xa230m. Tên dùng chungatlas2048×4096, bệ được gộpmesh. Nguồnmesh+3LOD đều0boundary/0nonmanifold sau weldpositionseams. public/assets/sanctuary/tower-buddha/asset.json lưu hashvàkíchthước. Authoring nguyênbản ở authoring/tower-buddhas.

Danh hiệu: Kinh Hiện Tại Hiền Kiếp Thiên Phật Danh, TaishōT0447a, bản Việt Nguyên Thuận, https://rongmotamhon.net/xem-kinh_hien-tai-hien-kiep_lckmltkq_viet2.html . Lưu nguyênbản nguồnđãđốichiếu ở canonical-source.html. Parser tríchđủ1000tên, xácnhận100tênđầu khớp100vịchánhđiện, chọn288têntiếptheo (ordinal101–388), lọc chuẩn hóa khoảngtrắng/gạch nối/chữhoa;0trùng nộibộvà0trùng100tênđiện. Không sáng tác tên. Đây là danhhiệu riêng gắn cùngmẫu mỹthuật, không khẳngđịnh hình tướng riêng của từngvị. Cần người am hiểu Phật học nghiệmthu trướcpháthànhchínhthức; không tự gán pháp khí hay tích truyện riêng.

Kiểm: tsc/buildpublic đạt;30test tháp/sông/tượng đạt, gồm3nhóm kiểm288tên/8mỗitầng/cửa,cột,lan can/LOD. Browserlocal đã thấyvậtliệu/mặt/tòasen/tượngtầng36 và3mesh có55.295vertices tổngLOD; ảnh tower288-floor36.png. Bộ đọcglTF được đăng kýtườngminh để tránh trườnghợp loader mặcđịnhtrảcontainer rỗng;ready chỉtrue khi có3lướiLOD thật. Số859.400triangles/10mesh trênpreview là riêngkiếntrúc,khônggồmtượng; khôngdùngđểbáotổngGPU. Chưa đoFPSđộclập,chưađibộquahết288vị/chưakiểmmọiGPU,mobile;khôngtuyênbốhếtlag. Checkpointauthoring/checkpoints/20261103-tower288.

## Danh mục (tầng / hướng cửa theo thứ tự kim đồng hồ)

1. Tầng 1, cửa 1 — Phạm Đức Phật (vị 101 trong nguồn).
2. Tầng 1, cửa 2 — Bảo Tích Phật (vị 102 trong nguồn).
3. Tầng 1, cửa 3 — Hoa Thiên Phật (vị 103 trong nguồn).
4. Tầng 1, cửa 4 — Thiện Tư Nghị Phật (vị 104 trong nguồn).
5. Tầng 1, cửa 5 — Pháp Tự Tại Phật (vị 105 trong nguồn).
6. Tầng 1, cửa 6 — Danh Văn Ý Phật (vị 106 trong nguồn).
7. Tầng 1, cửa 7 — Nhạo Thuyết Tụ Phật (vị 107 trong nguồn).
8. Tầng 1, cửa 8 — Kim Cang Tướng Phật (vị 108 trong nguồn).
9. Tầng 2, cửa 1 — Cầu Lợi Ích Phật (vị 109 trong nguồn).
10. Tầng 2, cửa 2 — Du Hí Thần Thông Phật (vị 110 trong nguồn).
11. Tầng 2, cửa 3 — Ly Ám Phật (vị 111 trong nguồn).
12. Tầng 2, cửa 4 — Danh Thiên Phật (vị 112 trong nguồn).
13. Tầng 2, cửa 5 — Di-lâu Tướng Phật (vị 113 trong nguồn).
14. Tầng 2, cửa 6 — Chúng Minh Phật (vị 114 trong nguồn).
15. Tầng 2, cửa 7 — Bảo Tạng Phật (vị 115 trong nguồn).
16. Tầng 2, cửa 8 — Cực Cao Hạnh Phật (vị 116 trong nguồn).
17. Tầng 3, cửa 1 — Kim Cang Thuẫn Phật (vị 117 trong nguồn).
18. Tầng 3, cửa 2 — Châu Giác Phật (vị 118 trong nguồn).
19. Tầng 3, cửa 3 — Đức Tán Phật (vị 119 trong nguồn).
20. Tầng 3, cửa 4 — Nhật Nguyệt Minh Phật (vị 120 trong nguồn).
21. Tầng 3, cửa 5 — Nhật Minh Phật (vị 121 trong nguồn).
22. Tầng 3, cửa 6 — Tinh Tú Phật (vị 122 trong nguồn).
23. Tầng 3, cửa 7 — Thanh Tịnh Nghĩa Phật (vị 123 trong nguồn).
24. Tầng 3, cửa 8 — Vi Lam Vương Phật (vị 124 trong nguồn).
25. Tầng 4, cửa 1 — Phước Tạng Phật (vị 125 trong nguồn).
26. Tầng 4, cửa 2 — Kiến Hữu Biên Phật (vị 126 trong nguồn).
27. Tầng 4, cửa 3 — Điện Minh Phật (vị 127 trong nguồn).
28. Tầng 4, cửa 4 — Kim Sơn Phật (vị 128 trong nguồn).
29. Tầng 4, cửa 5 — Sư Tử Đức Phật (vị 129 trong nguồn).
30. Tầng 4, cửa 6 — Thắng Tướng Phật (vị 130 trong nguồn).
31. Tầng 4, cửa 7 — Minh Tán Phật (vị 131 trong nguồn).
32. Tầng 4, cửa 8 — Kiên Tinh Tấn Phật (vị 132 trong nguồn).
33. Tầng 5, cửa 1 — Cụ Túc Tán Phật (vị 133 trong nguồn).
34. Tầng 5, cửa 2 — Ly Úy Sư Phật (vị 134 trong nguồn).
35. Tầng 5, cửa 3 — Ứng Thiên Phật (vị 135 trong nguồn).
36. Tầng 5, cửa 4 — Đại Đăng Phật (vị 136 trong nguồn).
37. Tầng 5, cửa 5 — Thế Minh Phật (vị 137 trong nguồn).
38. Tầng 5, cửa 6 — Diệu Âm Phật (vị 138 trong nguồn).
39. Tầng 5, cửa 7 — Trì Thượng Công Đức Phật (vị 139 trong nguồn).
40. Tầng 5, cửa 8 — Cám Thân Phật (vị 140 trong nguồn).
41. Tầng 6, cửa 1 — Sư Tử Giáp Phật (vị 141 trong nguồn).
42. Tầng 6, cửa 2 — Bảo Tán Phật (vị 142 trong nguồn).
43. Tầng 6, cửa 3 — Chúng Vương Phật (vị 143 trong nguồn).
44. Tầng 6, cửa 4 — Du Bộ Phật (vị 144 trong nguồn).
45. Tầng 6, cửa 5 — An Ẩn Phật (vị 145 trong nguồn).
46. Tầng 6, cửa 6 — Pháp Sai Biệt Phật (vị 146 trong nguồn).
47. Tầng 6, cửa 7 — Thượng Tôn Phật (vị 147 trong nguồn).
48. Tầng 6, cửa 8 — Cực Cao Đức Phật (vị 148 trong nguồn).
49. Tầng 7, cửa 1 — Thượng Sư Tử Âm Phật (vị 149 trong nguồn).
50. Tầng 7, cửa 2 — Nhạo Hí Phật (vị 150 trong nguồn).
51. Tầng 7, cửa 3 — Long Minh Phật (vị 151 trong nguồn).
52. Tầng 7, cửa 4 — Hoa Sơn Phật (vị 152 trong nguồn).
53. Tầng 7, cửa 5 — Long Hỷ Phật (vị 153 trong nguồn).
54. Tầng 7, cửa 6 — Hương Tự Tại Vương Phật (vị 154 trong nguồn).
55. Tầng 7, cửa 7 — Bảo Diễm Sơn Phật (vị 155 trong nguồn).
56. Tầng 7, cửa 8 — Thiên Lực Phật (vị 156 trong nguồn).
57. Tầng 8, cửa 1 — Đức Man Phật (vị 157 trong nguồn).
58. Tầng 8, cửa 2 — Long Thủ Phật (vị 158 trong nguồn).
59. Tầng 8, cửa 3 — Nhân Trang Nghiêm Phật (vị 159 trong nguồn).
60. Tầng 8, cửa 4 — Thiện Hạnh Ý Phật (vị 160 trong nguồn).
61. Tầng 8, cửa 5 — Trí Thắng Phật (vị 161 trong nguồn).
62. Tầng 8, cửa 6 — Vô Lượng Nhật Phật (vị 162 trong nguồn).
63. Tầng 8, cửa 7 — Thật Ngữ Phật (vị 163 trong nguồn).
64. Tầng 8, cửa 8 — Trì Cự Phật (vị 164 trong nguồn).
65. Tầng 9, cửa 1 — Định Ý Phật (vị 165 trong nguồn).
66. Tầng 9, cửa 2 — Vô Lượng Hình Phật (vị 166 trong nguồn).
67. Tầng 9, cửa 3 — Minh Chiếu Phật (vị 167 trong nguồn).
68. Tầng 9, cửa 4 — Tối Thắng Đăng Phật (vị 168 trong nguồn).
69. Tầng 9, cửa 5 — Đoạn Nghi Phật (vị 169 trong nguồn).
70. Tầng 9, cửa 6 — Trang Nghiêm Thân Phật (vị 170 trong nguồn).
71. Tầng 9, cửa 7 — Bất Hư Bộ Phật (vị 171 trong nguồn).
72. Tầng 9, cửa 8 — Giác Ngộ Phật (vị 172 trong nguồn).
73. Tầng 10, cửa 1 — Hoa Tướng Phật (vị 173 trong nguồn).
74. Tầng 10, cửa 2 — Sơn Chủ Vương Phật (vị 174 trong nguồn).
75. Tầng 10, cửa 3 — Thiện Uy Nghi Phật (vị 175 trong nguồn).
76. Tầng 10, cửa 4 — Biến Kiến Phật (vị 176 trong nguồn).
77. Tầng 10, cửa 5 — Vô Lượng Danh Phật (vị 177 trong nguồn).
78. Tầng 10, cửa 6 — Bảo Thiên Phật (vị 178 trong nguồn).
79. Tầng 10, cửa 7 — Diệt Quá Phật (vị 179 trong nguồn).
80. Tầng 10, cửa 8 — Trì Cam Lộ Phật (vị 180 trong nguồn).
81. Tầng 11, cửa 1 — Nhân Nguyệt Phật (vị 181 trong nguồn).
82. Tầng 11, cửa 2 — Hỷ Kiến Phật (vị 182 trong nguồn).
83. Tầng 11, cửa 3 — Trang Nghiêm Phật (vị 183 trong nguồn).
84. Tầng 11, cửa 4 — Châu Minh Phật (vị 184 trong nguồn).
85. Tầng 11, cửa 5 — Sơn Đảnh Phật (vị 185 trong nguồn).
86. Tầng 11, cửa 6 — Đáo Bỉ Ngạn Phật (vị 186 trong nguồn).
87. Tầng 11, cửa 7 — Pháp Tích Phật (vị 187 trong nguồn).
88. Tầng 11, cửa 8 — Định Nghĩa Phật (vị 188 trong nguồn).
89. Tầng 12, cửa 1 — Thí Nguyện Phật (vị 189 trong nguồn).
90. Tầng 12, cửa 2 — Bảo Tụ Phật (vị 190 trong nguồn).
91. Tầng 12, cửa 3 — Trụ Nghĩa Phật (vị 191 trong nguồn).
92. Tầng 12, cửa 4 — Mãn Ý Phật (vị 192 trong nguồn).
93. Tầng 12, cửa 5 — Thượng Tán Phật (vị 193 trong nguồn).
94. Tầng 12, cửa 6 — Từ Đức Phật (vị 194 trong nguồn).
95. Tầng 12, cửa 7 — Vô Cấu Phật (vị 195 trong nguồn).
96. Tầng 12, cửa 8 — Phạm Thiên Phật (vị 196 trong nguồn).
97. Tầng 13, cửa 1 — Hoa Minh Phật (vị 197 trong nguồn).
98. Tầng 13, cửa 2 — Thân Sai Biệt Phật (vị 198 trong nguồn).
99. Tầng 13, cửa 3 — Pháp Minh Phật (vị 199 trong nguồn).
100. Tầng 13, cửa 4 — Tận Kiến Phật (vị 200 trong nguồn).
101. Tầng 13, cửa 5 — Đức Tịnh Phật (vị 201 trong nguồn).
102. Tầng 13, cửa 6 — Nguyệt Diện Phật (vị 202 trong nguồn).
103. Tầng 13, cửa 7 — Bảo Đăng Phật (vị 203 trong nguồn).
104. Tầng 13, cửa 8 — Bảo Đang Phật (vị 204 trong nguồn).
105. Tầng 14, cửa 1 — Thượng Danh Phật (vị 205 trong nguồn).
106. Tầng 14, cửa 2 — Tác Danh Phật (vị 206 trong nguồn).
107. Tầng 14, cửa 3 — Vô Lượng Âm Phật (vị 207 trong nguồn).
108. Tầng 14, cửa 4 — Vi Lam Phật (vị 208 trong nguồn).
109. Tầng 14, cửa 5 — Sư Tử Thân Phật (vị 209 trong nguồn).
110. Tầng 14, cửa 6 — Minh Ý Phật (vị 210 trong nguồn).
111. Tầng 14, cửa 7 — Vô Năng Thắng Phật (vị 211 trong nguồn).
112. Tầng 14, cửa 8 — Công Đức Phẩm Phật (vị 212 trong nguồn).
113. Tầng 15, cửa 1 — Hải Tuệ Phật (vị 213 trong nguồn).
114. Tầng 15, cửa 2 — Đắc Thế Phật (vị 214 trong nguồn).
115. Tầng 15, cửa 3 — Vô Biên Hạnh Phật (vị 215 trong nguồn).
116. Tầng 15, cửa 4 — Khai Hoa Phật (vị 216 trong nguồn).
117. Tầng 15, cửa 5 — Tịnh Cấu Phật (vị 217 trong nguồn).
118. Tầng 15, cửa 6 — Kiến Nhất Thiết Nghĩa Phật (vị 218 trong nguồn).
119. Tầng 15, cửa 7 — Dũng Lực Phật (vị 219 trong nguồn).
120. Tầng 15, cửa 8 — Phú Túc Phật (vị 220 trong nguồn).
121. Tầng 16, cửa 1 — Phước Đức Phật (vị 221 trong nguồn).
122. Tầng 16, cửa 2 — Tùy Thời Phật (vị 222 trong nguồn).
123. Tầng 16, cửa 3 — Khánh Âm Phật (vị 223 trong nguồn).
124. Tầng 16, cửa 4 — Công Đức Kính Phật (vị 224 trong nguồn).
125. Tầng 16, cửa 5 — Quảng Ý Phật (vị 225 trong nguồn).
126. Tầng 16, cửa 6 — Thiện Tịch Diệt Phật (vị 226 trong nguồn).
127. Tầng 16, cửa 7 — Tài Thiên Phật (vị 227 trong nguồn).
128. Tầng 16, cửa 8 — Tịnh Đoạn Nghi Phật (vị 228 trong nguồn).
129. Tầng 17, cửa 1 — Vô Lượng Trì Phật (vị 229 trong nguồn).
130. Tầng 17, cửa 2 — Diệu Lạc Phật (vị 230 trong nguồn).
131. Tầng 17, cửa 3 — Bất Phụ Phật (vị 231 trong nguồn).
132. Tầng 17, cửa 4 — Vô Trụ Phật (vị 232 trong nguồn).
133. Tầng 17, cửa 5 — Đắc-xoa-ca Phật (vị 233 trong nguồn).
134. Tầng 17, cửa 6 — Chúng Thủ Phật (vị 234 trong nguồn).
135. Tầng 17, cửa 7 — Thế Quang Phật (vị 235 trong nguồn).
136. Tầng 17, cửa 8 — Đa Đức Phật (vị 236 trong nguồn).
137. Tầng 18, cửa 1 — Phất-sa Phật (vị 237 trong nguồn).
138. Tầng 18, cửa 2 — Vô Biên Uy Đức Phật (vị 238 trong nguồn).
139. Tầng 18, cửa 3 — Nghĩa Ý Phật (vị 239 trong nguồn).
140. Tầng 18, cửa 4 — Dược Vương Phật (vị 240 trong nguồn).
141. Tầng 18, cửa 5 — Đoạn Ác Phật (vị 241 trong nguồn).
142. Tầng 18, cửa 6 — Vô Nhiệt Phật (vị 242 trong nguồn).
143. Tầng 18, cửa 7 — Thiện Điều Phật (vị 243 trong nguồn).
144. Tầng 18, cửa 8 — Danh Đức Phật (vị 244 trong nguồn).
145. Tầng 19, cửa 1 — Hoa Đức Phật (vị 245 trong nguồn).
146. Tầng 19, cửa 2 — Dũng Đắc Phật (vị 246 trong nguồn).
147. Tầng 19, cửa 3 — Kim Cang Quân Phật (vị 247 trong nguồn).
148. Tầng 19, cửa 4 — Đại Đức Phật (vị 248 trong nguồn).
149. Tầng 19, cửa 5 — Tịch Diệt Ý Phật (vị 249 trong nguồn).
150. Tầng 19, cửa 6 — Vô Biên Âm Phật (vị 250 trong nguồn).
151. Tầng 19, cửa 7 — Đại Uy Quang Phật (vị 251 trong nguồn).
152. Tầng 19, cửa 8 — Thiện Trụ Phật (vị 252 trong nguồn).
153. Tầng 20, cửa 1 — Vô Sở Phụ Phật (vị 253 trong nguồn).
154. Tầng 20, cửa 2 — Ly Nghi Hoặc Phật (vị 254 trong nguồn).
155. Tầng 20, cửa 3 — Điện Tướng Phật (vị 255 trong nguồn).
156. Tầng 20, cửa 4 — Cung Kính Phật (vị 256 trong nguồn).
157. Tầng 20, cửa 5 — Uy Đức Thủ Phật (vị 257 trong nguồn).
158. Tầng 20, cửa 6 — Trí Nhật Phật (vị 258 trong nguồn).
159. Tầng 20, cửa 7 — Thượng Lợi Phật (vị 259 trong nguồn).
160. Tầng 20, cửa 8 — Tu-di Đảnh Phật (vị 260 trong nguồn).
161. Tầng 21, cửa 1 — Tịnh Tâm Phật (vị 261 trong nguồn).
162. Tầng 21, cửa 2 — Trị Oán Tặc Phật (vị 262 trong nguồn).
163. Tầng 21, cửa 3 — Ly Kiêu Phật (vị 263 trong nguồn).
164. Tầng 21, cửa 4 — Ứng Tán Phật (vị 264 trong nguồn).
165. Tầng 21, cửa 5 — Trí Thứ Phật (vị 265 trong nguồn).
166. Tầng 21, cửa 6 — Na-la-đạt Phật (vị 266 trong nguồn).
167. Tầng 21, cửa 7 — Thường Lạc Phật (vị 267 trong nguồn).
168. Tầng 21, cửa 8 — Bất Thiểu Quốc Phật (vị 268 trong nguồn).
169. Tầng 22, cửa 1 — Thiên Danh Phật (vị 269 trong nguồn).
170. Tầng 22, cửa 2 — Vân Đức Phật (vị 270 trong nguồn).
171. Tầng 22, cửa 3 — Thậm Lương Phật (vị 271 trong nguồn).
172. Tầng 22, cửa 4 — Đa Công Đức Phật (vị 272 trong nguồn).
173. Tầng 22, cửa 5 — Bảo Nguyệt Phật (vị 273 trong nguồn).
174. Tầng 22, cửa 6 — Trang Nghiêm Đảnh Kế Phật (vị 274 trong nguồn).
175. Tầng 22, cửa 7 — Nhạo Thiền Phật (vị 275 trong nguồn).
176. Tầng 22, cửa 8 — Vô Sở Thiểu Phật (vị 276 trong nguồn).
177. Tầng 23, cửa 1 — Du Hí Phật (vị 277 trong nguồn).
178. Tầng 23, cửa 2 — Đức Bảo Phật (vị 278 trong nguồn).
179. Tầng 23, cửa 3 — Ứng Danh Xưng Phật (vị 279 trong nguồn).
180. Tầng 23, cửa 4 — Hoa Thân Phật (vị 280 trong nguồn).
181. Tầng 23, cửa 5 — Đại Âm Thanh Phật (vị 281 trong nguồn).
182. Tầng 23, cửa 6 — Biện Tài Tán Phật (vị 282 trong nguồn).
183. Tầng 23, cửa 7 — Kim Cang Châu Phật (vị 283 trong nguồn).
184. Tầng 23, cửa 8 — Vô Lượng Thọ Phật (vị 284 trong nguồn).
185. Tầng 24, cửa 1 — Châu Trang Nghiêm Phật (vị 285 trong nguồn).
186. Tầng 24, cửa 2 — Đại Vương Phật (vị 286 trong nguồn).
187. Tầng 24, cửa 3 — Đức Cao Hạnh Phật (vị 287 trong nguồn).
188. Tầng 24, cửa 4 — Cao Danh Phật (vị 288 trong nguồn).
189. Tầng 24, cửa 5 — Bách Quang Phật (vị 289 trong nguồn).
190. Tầng 24, cửa 6 — Hỷ Duyệt Phật (vị 290 trong nguồn).
191. Tầng 24, cửa 7 — Long Bộ Phật (vị 291 trong nguồn).
192. Tầng 24, cửa 8 — Ý Nguyện Phật (vị 292 trong nguồn).
193. Tầng 25, cửa 1 — Diệu Bảo Phật (vị 293 trong nguồn).
194. Tầng 25, cửa 2 — Diệt Dĩ Phật (vị 294 trong nguồn).
195. Tầng 25, cửa 3 — Pháp Tràng Phật (vị 295 trong nguồn).
196. Tầng 25, cửa 4 — Điều Ngự Phật (vị 296 trong nguồn).
197. Tầng 25, cửa 5 — Hỷ Tự Tại Phật (vị 297 trong nguồn).
198. Tầng 25, cửa 6 — Bảo Kế Phật (vị 298 trong nguồn).
199. Tầng 25, cửa 7 — Ly Sơn Phật (vị 299 trong nguồn).
200. Tầng 25, cửa 8 — Tịnh Thiên Phật (vị 300 trong nguồn).
201. Tầng 26, cửa 1 — Hoa Quan Phật (vị 301 trong nguồn).
202. Tầng 26, cửa 2 — Tịnh Danh Phật (vị 302 trong nguồn).
203. Tầng 26, cửa 3 — Uy Đức Tịch Diệt Phật (vị 303 trong nguồn).
204. Tầng 26, cửa 4 — Ái Tướng Phật (vị 304 trong nguồn).
205. Tầng 26, cửa 5 — Đa Thiên Phật (vị 305 trong nguồn).
206. Tầng 26, cửa 6 — Tu-diễm-ma Phật (vị 306 trong nguồn).
207. Tầng 26, cửa 7 — Thiên Uy Phật (vị 307 trong nguồn).
208. Tầng 26, cửa 8 — Diệu Đức Vương Phật (vị 308 trong nguồn).
209. Tầng 27, cửa 1 — Bảo Bộ Phật (vị 309 trong nguồn).
210. Tầng 27, cửa 2 — Sư Tử Phần Phật (vị 310 trong nguồn).
211. Tầng 27, cửa 3 — Tối Tôn Thắng Phật (vị 311 trong nguồn).
212. Tầng 27, cửa 4 — Nhân Vương Phật (vị 312 trong nguồn).
213. Tầng 27, cửa 5 — Chiên Đàn Vân Phật (vị 313 trong nguồn).
214. Tầng 27, cửa 6 — Cám Nhãn Phật (vị 314 trong nguồn).
215. Tầng 27, cửa 7 — Bảo Uy Đức Phật (vị 315 trong nguồn).
216. Tầng 27, cửa 8 — Đức Thừa Phật (vị 316 trong nguồn).
217. Tầng 28, cửa 1 — Giác Tưởng Phật (vị 317 trong nguồn).
218. Tầng 28, cửa 2 — Hỷ Trang Nghiêm Phật (vị 318 trong nguồn).
219. Tầng 28, cửa 3 — Hương Tế Phật (vị 319 trong nguồn).
220. Tầng 28, cửa 4 — Thắng Tuệ Phật (vị 320 trong nguồn).
221. Tầng 28, cửa 5 — Ly Ái Phật (vị 321 trong nguồn).
222. Tầng 28, cửa 6 — Từ Tướng Phật (vị 322 trong nguồn).
223. Tầng 28, cửa 7 — Diệu Hương Phật (vị 323 trong nguồn).
224. Tầng 28, cửa 8 — Kiên Khải Phật (vị 324 trong nguồn).
225. Tầng 29, cửa 1 — Uy Đức Mãnh Phật (vị 325 trong nguồn).
226. Tầng 29, cửa 2 — Châu Khải Phật (vị 326 trong nguồn).
227. Tầng 29, cửa 3 — Nhân Hiền Phật (vị 327 trong nguồn).
228. Tầng 29, cửa 4 — Thiện Thệ Nguyệt Phật (vị 328 trong nguồn).
229. Tầng 29, cửa 5 — Phạm Tự Tại Phật (vị 329 trong nguồn).
230. Tầng 29, cửa 6 — Sư Tử Nguyệt Phật (vị 330 trong nguồn).
231. Tầng 29, cửa 7 — Quán Sát Tuệ Phật (vị 331 trong nguồn).
232. Tầng 29, cửa 8 — Chánh Sanh Phật (vị 332 trong nguồn).
233. Tầng 30, cửa 1 — Cao Thắng Phật (vị 333 trong nguồn).
234. Tầng 30, cửa 2 — Nhật Quán Phật (vị 334 trong nguồn).
235. Tầng 30, cửa 3 — Bảo Danh Phật (vị 335 trong nguồn).
236. Tầng 30, cửa 4 — Đại Tinh Tấn Phật (vị 336 trong nguồn).
237. Tầng 30, cửa 5 — Sơn Quang Phật (vị 337 trong nguồn).
238. Tầng 30, cửa 6 — Đức Tụ Vương Phật (vị 338 trong nguồn).
239. Tầng 30, cửa 7 — Cúng Dường Danh Phật (vị 339 trong nguồn).
240. Tầng 30, cửa 8 — Pháp Tán Phật (vị 340 trong nguồn).
241. Tầng 31, cửa 1 — Thí Minh Phật (vị 341 trong nguồn).
242. Tầng 31, cửa 2 — Điện Đức Phật (vị 342 trong nguồn).
243. Tầng 31, cửa 3 — Bảo Ngữ Phật (vị 343 trong nguồn).
244. Tầng 31, cửa 4 — Cứu Mạng Phật (vị 344 trong nguồn).
245. Tầng 31, cửa 5 — Thiện Giới Phật (vị 345 trong nguồn).
246. Tầng 31, cửa 6 — Thiện Chúng Phật (vị 346 trong nguồn).
247. Tầng 31, cửa 7 — Kiên Cố Tuệ Phật (vị 347 trong nguồn).
248. Tầng 31, cửa 8 — Phá Hữu Ám Phật (vị 348 trong nguồn).
249. Tầng 32, cửa 1 — Thiện Thắng Phật (vị 349 trong nguồn).
250. Tầng 32, cửa 2 — Sư Tử Quang Phật (vị 350 trong nguồn).
251. Tầng 32, cửa 3 — Chiếu Minh Phật (vị 351 trong nguồn).
252. Tầng 32, cửa 4 — Bảo Thành Tựu Phật (vị 352 trong nguồn).
253. Tầng 32, cửa 5 — Lợi Tuệ Phật (vị 353 trong nguồn).
254. Tầng 32, cửa 6 — Châu Nguyệt Quang Phật (vị 354 trong nguồn).
255. Tầng 32, cửa 7 — Uy Quang Phật (vị 355 trong nguồn).
256. Tầng 32, cửa 8 — Bất Phá Luận Phật (vị 356 trong nguồn).
257. Tầng 33, cửa 1 — Quang Minh Vương Phật (vị 357 trong nguồn).
258. Tầng 33, cửa 2 — Châu Luân Phật (vị 358 trong nguồn).
259. Tầng 33, cửa 3 — Kim Cang Tuệ Phật (vị 359 trong nguồn).
260. Tầng 33, cửa 4 — Kiết Thủ Phật (vị 360 trong nguồn).
261. Tầng 33, cửa 5 — Thiện Nguyệt Phật (vị 361 trong nguồn).
262. Tầng 33, cửa 6 — Bảo Diễm Phật (vị 362 trong nguồn).
263. Tầng 33, cửa 7 — La-hầu Thủ Phật (vị 363 trong nguồn).
264. Tầng 33, cửa 8 — Nhạo Bồ-đề Phật (vị 364 trong nguồn).
265. Tầng 34, cửa 1 — Đẳng Quang Phật (vị 365 trong nguồn).
266. Tầng 34, cửa 2 — Chí Tịch Diệt Phật (vị 366 trong nguồn).
267. Tầng 34, cửa 3 — Thế Tối Diệu Phật (vị 367 trong nguồn).
268. Tầng 34, cửa 4 — Tự Tại Danh Phật (vị 368 trong nguồn).
269. Tầng 34, cửa 5 — Thập Thế Lực Phật (vị 369 trong nguồn).
270. Tầng 34, cửa 6 — Hỷ Lực Vương Phật (vị 370 trong nguồn).
271. Tầng 34, cửa 7 — Đức Thế Lực Phật (vị 371 trong nguồn).
272. Tầng 34, cửa 8 — Tối Thắng Đảnh Phật (vị 372 trong nguồn).
273. Tầng 35, cửa 1 — Đại Thế Lực Phật (vị 373 trong nguồn).
274. Tầng 35, cửa 2 — Công Đức Tạng Phật (vị 374 trong nguồn).
275. Tầng 35, cửa 3 — Chân Hạnh Phật (vị 375 trong nguồn).
276. Tầng 35, cửa 4 — Thượng An Phật (vị 376 trong nguồn).
277. Tầng 35, cửa 5 — Kim Cang Tri Sơn Phật (vị 377 trong nguồn).
278. Tầng 35, cửa 6 — Đại Quang Phật (vị 378 trong nguồn).
279. Tầng 35, cửa 7 — Diệu Đức Tạng Phật (vị 379 trong nguồn).
280. Tầng 35, cửa 8 — Quảng Đức Phật (vị 380 trong nguồn).
281. Tầng 36, cửa 1 — Bảo Võng Nghiêm Thân Phật (vị 381 trong nguồn).
282. Tầng 36, cửa 2 — Phước Đức Minh Phật (vị 382 trong nguồn).
283. Tầng 36, cửa 3 — Tạo Khải Phật (vị 383 trong nguồn).
284. Tầng 36, cửa 4 — Thành Thủ Phật (vị 384 trong nguồn).
285. Tầng 36, cửa 5 — Thiện Hoa Phật (vị 385 trong nguồn).
286. Tầng 36, cửa 6 — Tập Bảo Phật (vị 386 trong nguồn).
287. Tầng 36, cửa 7 — Đại Hải Trí Phật (vị 387 trong nguồn).
288. Tầng 36, cửa 8 — Trì Địa Đức Phật (vị 388 trong nguồn).
