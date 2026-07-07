import ArchiveShared.Basics

namespace Archive.EuclidElementsI47

def square (n : Nat) : Nat := ArchiveShared.square n

def PythagoreanStyle (a b c : Nat) : Prop :=
  square c = square a + square b

end Archive.EuclidElementsI47
