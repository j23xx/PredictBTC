{\rtf1\ansi\ansicpg1252\cocoartf2822
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 Menlo-Regular;}
{\colortbl;\red255\green255\blue255;\red31\green69\blue255;\red255\green255\blue255;\red13\green13\blue13;
\red0\green0\blue0;\red46\green126\blue46;\red34\green157\blue130;\red35\green35\blue35;\red190\green20\blue31;
\red240\green106\blue20;}
{\*\expandedcolortbl;;\cssrgb\c16078\c38431\c100000;\cssrgb\c100000\c100000\c100000;\cssrgb\c5882\c5882\c5882;
\cssrgb\c0\c0\c0;\cssrgb\c21961\c55686\c23529;\cssrgb\c13333\c67059\c58039;\cssrgb\c18039\c18039\c18039;\cssrgb\c80000\c16078\c16078;
\cssrgb\c96078\c49804\c9020;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab720
\pard\pardeftab720\partightenfactor0

\f0\fs26 \cf2 \cb3 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 indicator\cf4 \strokec5 (\cf6 \strokec6 'EMA Cross Scanner'\cf7 \strokec7 ,\cf4 \strokec4  \cf8 \strokec8 overlay\cf7 \strokec7 =\cf9 \strokec9 true\cf4 \strokec5 )\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf8 \cb3 \strokec8 emaFast\cf4 \strokec4  \cf7 \strokec7 =\cf4 \strokec4  \cf2 \strokec2 ta.ema\cf4 \strokec5 (\cf9 \strokec9 close\cf7 \strokec7 ,\cf4 \strokec4  \cf10 \strokec10 33\cf4 \strokec5 )\cb1 \strokec4 \
\cf8 \cb3 \strokec8 emaSlow\cf4 \strokec4  \cf7 \strokec7 =\cf4 \strokec4  \cf2 \strokec2 ta.ema\cf4 \strokec5 (\cf9 \strokec9 close\cf7 \strokec7 ,\cf4 \strokec4  \cf10 \strokec10 55\cf4 \strokec5 )\cb1 \strokec4 \
\
\cf8 \cb3 \strokec8 trendFast\cf4 \strokec4  \cf7 \strokec7 =\cf4 \strokec4  \cf2 \strokec2 ta.ema\cf4 \strokec5 (\cf9 \strokec9 close\cf7 \strokec7 ,\cf4 \strokec4  \cf10 \strokec10 100\cf4 \strokec5 )\cb1 \strokec4 \
\cf8 \cb3 \strokec8 trendSlow\cf4 \strokec4  \cf7 \strokec7 =\cf4 \strokec4  \cf2 \strokec2 ta.ema\cf4 \strokec5 (\cf9 \strokec9 close\cf7 \strokec7 ,\cf4 \strokec4  \cf10 \strokec10 200\cf4 \strokec5 )\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 plot\cf4 \strokec5 (\cf8 \strokec8 emaFast\cf7 \strokec7 ,\cf4 \strokec4  \cf8 \strokec8 color\cf7 \strokec7 =\cf2 \strokec2 color.new\cf4 \strokec5 (\cf9 \strokec9 color.red\cf7 \strokec7 ,\cf4 \strokec4  \cf10 \strokec10 0\cf4 \strokec5 )\cf7 \strokec7 ,\cf4 \strokec4  \cf8 \strokec8 linewidth\cf7 \strokec7 =\cf10 \strokec10 1\cf4 \strokec5 )\cb1 \strokec4 \
\cf2 \cb3 \strokec2 plot\cf4 \strokec5 (\cf8 \strokec8 emaSlow\cf7 \strokec7 ,\cf4 \strokec4  \cf8 \strokec8 color\cf7 \strokec7 =\cf2 \strokec2 color.new\cf4 \strokec5 (\cf9 \strokec9 color.blue\cf7 \strokec7 ,\cf4 \strokec4  \cf10 \strokec10 0\cf4 \strokec5 )\cf7 \strokec7 ,\cf4 \strokec4  \cf8 \strokec8 linewidth\cf7 \strokec7 =\cf10 \strokec10 1\cf4 \strokec5 )\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf8 \cb3 \strokec8 fast\cf4 \strokec4  \cf7 \strokec7 =\cf4 \strokec4  \cf2 \strokec2 plot\cf4 \strokec5 (\cf8 \strokec8 emaFast\cf7 \strokec7 ,\cf4 \strokec4  \cf8 \strokec8 color\cf7 \strokec7 =\cf2 \strokec2 color.new\cf4 \strokec5 (\cf9 \strokec9 color.black\cf7 \strokec7 ,\cf4 \strokec4  \cf10 \strokec10 100\cf4 \strokec5 )\cf7 \strokec7 ,\cf4 \strokec4  \cf8 \strokec8 linewidth\cf7 \strokec7 =\cf10 \strokec10 1\cf4 \strokec5 )\cb1 \strokec4 \
\cf8 \cb3 \strokec8 slow\cf4 \strokec4  \cf7 \strokec7 =\cf4 \strokec4  \cf2 \strokec2 plot\cf4 \strokec5 (\cf8 \strokec8 emaSlow\cf7 \strokec7 ,\cf4 \strokec4  \cf8 \strokec8 color\cf7 \strokec7 =\cf2 \strokec2 color.new\cf4 \strokec5 (\cf9 \strokec9 color.black\cf7 \strokec7 ,\cf4 \strokec4  \cf10 \strokec10 100\cf4 \strokec5 )\cf7 \strokec7 ,\cf4 \strokec4  \cf8 \strokec8 linewidth\cf7 \strokec7 =\cf10 \strokec10 1\cf4 \strokec5 )\cb1 \strokec4 \
\
\cf8 \cb3 \strokec8 f\cf4 \strokec4  \cf7 \strokec7 =\cf4 \strokec4  \cf2 \strokec2 plot\cf4 \strokec5 (\cf8 \strokec8 trendFast\cf7 \strokec7 ,\cf4 \strokec4  \cf8 \strokec8 color\cf7 \strokec7 =\cf2 \strokec2 color.new\cf4 \strokec5 (\cf9 \strokec9 color.black\cf7 \strokec7 ,\cf4 \strokec4  \cf10 \strokec10 100\cf4 \strokec5 )\cf7 \strokec7 ,\cf4 \strokec4  \cf8 \strokec8 linewidth\cf7 \strokec7 =\cf10 \strokec10 1\cf4 \strokec5 )\cb1 \strokec4 \
\cf8 \cb3 \strokec8 s\cf4 \strokec4  \cf7 \strokec7 =\cf4 \strokec4  \cf2 \strokec2 plot\cf4 \strokec5 (\cf8 \strokec8 trendSlow\cf7 \strokec7 ,\cf4 \strokec4  \cf8 \strokec8 color\cf7 \strokec7 =\cf2 \strokec2 color.new\cf4 \strokec5 (\cf9 \strokec9 color.black\cf7 \strokec7 ,\cf4 \strokec4  \cf10 \strokec10 100\cf4 \strokec5 )\cf7 \strokec7 ,\cf4 \strokec4  \cf8 \strokec8 linewidth\cf7 \strokec7 =\cf10 \strokec10 1\cf4 \strokec5 )\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 fill\cf4 \strokec4  \strokec5 (\cf8 \strokec8 f\cf7 \strokec7 ,\cf4 \strokec4  \cf8 \strokec8 s\cf7 \strokec7 ,\cf4 \strokec4  \cf8 \strokec8 color\cf7 \strokec7 =\cf8 \strokec8 trendFast\cf4 \strokec4  \cf7 \strokec7 >\cf4 \strokec4  \cf8 \strokec8 trendSlow\cf4 \strokec4  \cf7 \strokec7 ?\cf4 \strokec4  \cf2 \strokec2 color.new\cf4 \strokec5 (\cf9 \strokec9 color.green\cf7 \strokec7 ,\cf4 \strokec4  \cf10 \strokec10 93\cf4 \strokec5 )\strokec4  \cf7 \strokec7 :\cf4 \strokec4  \cf2 \strokec2 color.new\cf4 \strokec5 (\cf9 \strokec9 color.red\cf7 \strokec7 ,\cf4 \strokec4  \cf10 \strokec10 93\cf4 \strokec5 ))\strokec4  \cb1 \
}